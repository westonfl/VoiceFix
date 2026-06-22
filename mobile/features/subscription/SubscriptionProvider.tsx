import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

import {
  getRevenueCatApiKey,
  REVENUECAT_ENTITLEMENT_ID,
} from '@/constants/env';

export type SubscriptionStatus =
  | 'loading'
  | 'active'
  | 'inactive'
  | 'unconfigured'
  | 'error';

type SubscriptionContextValue = {
  status: SubscriptionStatus;
  offering: PurchasesOffering | null;
  error: string | null;
  entitlementId: string;
  refresh: () => Promise<void>;
  restore: () => Promise<boolean>;
  purchase: (selectedPackage: PurchasesPackage) => Promise<'purchased' | 'cancelled'>;
  openCustomerCenter: () => Promise<void>;
  syncCustomerInfo: (customerInfo: CustomerInfo) => void;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);
let configurationPromise: Promise<void> | null = null;

function hasEntitlement(customerInfo: CustomerInfo) {
  return Boolean(
    customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID],
  );
}

async function ensureConfigured(apiKey: string) {
  if (!configurationPromise) {
    configurationPromise = (async () => {
      const alreadyConfigured = await Purchases.isConfigured();

      if (!alreadyConfigured) {
        Purchases.configure({ apiKey });
      }

      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
    })();
  }

  return configurationPromise;
}

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const platform = Platform.OS;
  const apiKey = getRevenueCatApiKey(platform);
  const offeringRef = useRef<PurchasesOffering | null>(null);
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncCustomerInfo = useCallback((customerInfo: CustomerInfo) => {
    setError(null);
    setStatus(
      hasEntitlement(customerInfo)
        ? 'active'
        : offeringRef.current
          ? 'inactive'
          : 'loading',
    );
  }, []);

  const loadAccess = useCallback(async () => {
    if (!apiKey) {
      setStatus('unconfigured');
      return;
    }

    setError(null);
    setStatus('loading');

    try {
      await ensureConfigured(apiKey);
      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      const currentOffering = offerings.current;
      offeringRef.current = currentOffering;
      setOffering(currentOffering);

      if (hasEntitlement(customerInfo)) {
        setStatus('active');
        return;
      }

      if (!currentOffering || currentOffering.availablePackages.length === 0) {
        setError('The current RevenueCat offering has no available packages.');
        setStatus('error');
        return;
      }

      setStatus('inactive');
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'RevenueCat could not verify subscription access.',
      );
      setStatus('error');
    }
  }, [apiKey]);

  useEffect(() => {
    if (!apiKey) {
      setStatus('unconfigured');
      return;
    }

    let mounted = true;
    const listener = (customerInfo: CustomerInfo) => {
      if (mounted) {
        syncCustomerInfo(customerInfo);
      }
    };

    ensureConfigured(apiKey)
      .then(() => {
        if (!mounted) {
          return;
        }

        Purchases.addCustomerInfoUpdateListener(listener);
        return loadAccess();
      })
      .catch((configurationError) => {
        if (!mounted) {
          return;
        }

        setError(
          configurationError instanceof Error
            ? configurationError.message
            : 'RevenueCat could not be configured.',
        );
        setStatus('error');
      });

    return () => {
      mounted = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [apiKey, loadAccess, syncCustomerInfo]);

  const restore = useCallback(async () => {
    if (!apiKey) {
      return false;
    }

    try {
      await ensureConfigured(apiKey);
      const customerInfo = await Purchases.restorePurchases();
      const restored = hasEntitlement(customerInfo);

      if (restored) {
        syncCustomerInfo(customerInfo);
      } else {
        await loadAccess();
      }

      return restored;
    } catch (restoreError) {
      setError(
        restoreError instanceof Error
          ? restoreError.message
          : 'Your purchases could not be restored.',
      );
      return false;
    }
  }, [apiKey, loadAccess, syncCustomerInfo]);

  const purchase = useCallback(
    async (selectedPackage: PurchasesPackage) => {
      if (!apiKey) {
        throw new Error('RevenueCat is not configured for this platform.');
      }

      await ensureConfigured(apiKey);

      try {
        const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
        syncCustomerInfo(customerInfo);

        if (!hasEntitlement(customerInfo)) {
          throw new Error('The purchase completed, but access is not active yet.');
        }

        return 'purchased' as const;
      } catch (purchaseError) {
        if (
          typeof purchaseError === 'object' &&
          purchaseError !== null &&
          'code' in purchaseError &&
          purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
        ) {
          return 'cancelled' as const;
        }

        throw purchaseError;
      }
    },
    [apiKey, syncCustomerInfo],
  );

  const openCustomerCenter = useCallback(async () => {
    if (!apiKey) {
      throw new Error('RevenueCat is not configured for this platform.');
    }

    await ensureConfigured(apiKey);
    await RevenueCatUI.presentCustomerCenter();
    await loadAccess();
  }, [apiKey, loadAccess]);

  const value = useMemo(
    () => ({
      status,
      offering,
      error,
      entitlementId: REVENUECAT_ENTITLEMENT_ID,
      refresh: loadAccess,
      restore,
      purchase,
      openCustomerCenter,
      syncCustomerInfo,
    }),
    [
      error,
      loadAccess,
      offering,
      openCustomerCenter,
      purchase,
      restore,
      status,
      syncCustomerInfo,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error('useSubscription must be used inside SubscriptionProvider');
  }

  return context;
}
