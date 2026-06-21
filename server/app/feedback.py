from __future__ import annotations

import json
from typing import Any

from .models import Comparison, DrillId, Feedback, Language, MonthOneMetrics, Quality


def safety_flags(metrics: MonthOneMetrics, quality: Quality) -> list[str]:
    flags: list[str] = []

    if quality == "too_short":
        flags.append("too_short_to_judge")
    if quality == "too_quiet":
        flags.append("too_quiet_to_judge")
    if quality == "clipped":
        flags.append("likely_too_loud_or_too_close")
    if quality == "noisy":
        flags.append("likely_noise_or_silence")
    if metrics.onsetAbruptness > 0.55:
        flags.append("abrupt_start")
    if metrics.fadeAmount > 0.55:
        flags.append("ending_faded")

    flags.append("stop_if_pain_or_dizziness")
    return flags


def build_feedback(drill_id: DrillId, metrics: MonthOneMetrics, quality: Quality, language: Language) -> Feedback:
    if language == "ko":
        return _feedback_ko(drill_id, metrics, quality)

    return _feedback_en(drill_id, metrics, quality)


def build_comparison(previous_metrics_json: str | None, current: MonthOneMetrics, language: Language) -> Comparison | None:
    if not previous_metrics_json:
        return None

    try:
        previous_data: dict[str, Any] = json.loads(previous_metrics_json)
        previous = MonthOneMetrics.model_validate(previous_data)
    except Exception:
        return None

    steadiness_delta = round(current.loudnessSteadiness - previous.loudnessSteadiness, 3)
    fade_delta = round(previous.fadeAmount - current.fadeAmount, 3)
    resonance_delta = round(current.resonanceScore - previous.resonanceScore, 3)
    pitch_delta = None
    if previous.pitchStability is not None and current.pitchStability is not None:
        pitch_delta = round(current.pitchStability - previous.pitchStability, 3)

    score = steadiness_delta + fade_delta + resonance_delta + (pitch_delta or 0.0)
    improved = score > 0.04

    if language == "ko":
        if improved:
            summary = "재시도에서 한 가지 이상이 더 안정적으로 들렸습니다. 같은 크기와 편안함을 다시 찾아보세요."
        elif abs(score) <= 0.04:
            summary = "재시도는 첫 테이크와 비슷했습니다. 길이보다 더 쉬운 느낌이 있었는지 확인해보세요."
        else:
            summary = "재시도에서 안정감이 조금 줄었습니다. 다음에는 더 작고 편한 시작으로 돌아가보세요."
    else:
        if improved:
            summary = "The retry sounded likely steadier in at least one useful way. Try to remember that easier setup."
        elif abs(score) <= 0.04:
            summary = "The retry was broadly similar. That is still useful; listen for whether it felt easier."
        else:
            summary = "The retry was a little less steady by these proxy measures. Return to a smaller, easier start."

    changed = {
        "loudnessSteadinessDelta": steadiness_delta,
        "fadeImprovement": fade_delta,
        "resonanceScoreDelta": resonance_delta,
    }
    if pitch_delta is not None:
        changed["pitchStabilityDelta"] = pitch_delta

    return Comparison(summary=summary, improved=improved, changedMetrics=changed)


def _feedback_en(drill_id: DrillId, metrics: MonthOneMetrics, quality: Quality) -> Feedback:
    if quality != "usable":
        heard = {
            "too_short": f"The clip was very short, about {metrics.durationSec:.1f}s.",
            "too_quiet": "The recording was likely too quiet for useful analysis.",
            "clipped": "The recording likely clipped, which means the mic was overloaded.",
            "noisy": "The recording had too much silence or room noise to judge confidently.",
            "unsupported": "The recording could not be judged confidently.",
        }[quality]
        return Feedback(
            whatWeHeard=heard,
            whatItOftenMeans="This usually means the signal needs to be simpler before the app can compare it.",
            oneThingToTry="Record again with the phone a little away from your mouth in a quiet room.",
            retryGoal="Give Rehear a small, clear take without pushing.",
        )

    if drill_id == "sustained_hiss":
        if metrics.fadeAmount > 0.42:
            return Feedback(
                whatWeHeard="The hiss likely faded near the ending.",
                whatItOftenMeans="That often happens when too much air leaves at the start.",
                oneThingToTry="Use a smaller hiss and keep the first second calmer.",
                retryGoal="Aim for a smoother final third, not a longer take.",
            )
        if metrics.burstRatio > 1.45:
            return Feedback(
                whatWeHeard="The beginning was likely stronger than the rest of the hiss.",
                whatItOftenMeans="That can mean the air is being dumped instead of released steadily.",
                oneThingToTry="Start with half as much air and let the hiss stay narrow.",
                retryGoal="Make the beginning and middle feel closer in size.",
            )
        if metrics.loudnessSteadiness < 0.45:
            return Feedback(
                whatWeHeard="The air stream likely wobbled in volume.",
                whatItOftenMeans="For this breath exercise, that often means the airflow is being managed too actively.",
                oneThingToTry="Make the hiss smaller and let it run without correcting it.",
                retryGoal="Aim for one plain, even line of air.",
            )
    elif drill_id == "gentle_hum":
        if metrics.pitchStability is not None and metrics.pitchStability < 0.45:
            return Feedback(
                whatWeHeard="The hum had some pitch movement.",
                whatItOftenMeans="That often means the tiny sound is not fully settled yet.",
                oneThingToTry="Use less volume and let the hum sit on one comfortable pitch.",
                retryGoal="Keep the hum small and still for a few seconds.",
            )
        if metrics.loudnessSteadiness < 0.46:
            return Feedback(
                whatWeHeard="The hum likely changed size during the take.",
                whatItOftenMeans="That often happens when the breath and sound are not cooperating yet.",
                oneThingToTry="Hum at half volume and stop before it gets effortful.",
                retryGoal="Make the hum boringly even.",
            )
    elif drill_id == "soft_hum_start":
        if metrics.onsetAbruptness > 0.45:
            return Feedback(
                whatWeHeard="The sound likely arrived a little abruptly.",
                whatItOftenMeans="A hard start often makes beginners add throat effort.",
                oneThingToTry="Let the sound fade in gently instead of switching it on.",
                retryGoal="Make the first half-second softer and easier.",
            )
        if metrics.burstRatio > 1.35:
            return Feedback(
                whatWeHeard="The first moment was likely larger than the rest of the hum.",
                whatItOftenMeans="For this start exercise, that often means the onset is being grabbed.",
                oneThingToTry="Breathe first, then let the hum appear as late and lightly as possible.",
                retryGoal="Make the start feel like it sneaks in.",
            )
    elif drill_id == "mmm_resonance":
        if metrics.pitchStability is not None and metrics.pitchStability < 0.45:
            return Feedback(
                whatWeHeard="The mmm had some pitch movement.",
                whatItOftenMeans="That can make the resonance feeling harder to notice.",
                oneThingToTry="Make the mmm smaller and stay on one easy pitch.",
                retryGoal="Keep the mmm steady enough to notice the buzz.",
            )
        if metrics.resonanceScore < 0.42:
            return Feedback(
                whatWeHeard="The mmm sounded less ringy by the resonance proxy measures.",
                whatItOftenMeans="That often means the hum is breathy, low-heavy, or pressed too small to ring.",
                oneThingToTry="Keep the lips closed gently and look for a tiny buzz without adding volume.",
                retryGoal="Find a small, repeatable mmm buzz.",
            )
        if metrics.throatEnergyRatio > 0.5 and metrics.forwardEnergyRatio < 0.12:
            return Feedback(
                whatWeHeard="The sound was likely weighted low in the spectrum.",
                whatItOftenMeans="For this mmm exercise, that can be a proxy for a heavier, less forward setup.",
                oneThingToTry="Lighten the hum and let the vibration feel closer to the lips.",
                retryGoal="Look for a small, easy vibration instead of a bigger sound.",
            )
        if metrics.resonanceStability < 0.45:
            return Feedback(
                whatWeHeard="The resonance color shifted during the mmm.",
                whatItOftenMeans="That often happens when volume or pressure changes while sustaining.",
                oneThingToTry="Keep the hum very quiet and still for this retry.",
                retryGoal="Make the resonance feel repeatable for a few seconds.",
            )
    elif drill_id == "fah_vah_resonance":
        if metrics.onsetAbruptness > 0.48:
            return Feedback(
                whatWeHeard="The FAH or VAH likely started with a firm edge.",
                whatItOftenMeans="That can hide the easy ring this exercise is looking for.",
                oneThingToTry="Start the consonant softer and let the vowel open after it.",
                retryGoal="Make the consonant-vowel feel connected, not punched.",
            )
        if metrics.resonanceScore < 0.42:
            return Feedback(
                whatWeHeard="The vowel sounded less ringy by the resonance proxy measures.",
                whatItOftenMeans="That often means the sound is low-heavy, breathy, masked by accompaniment, or not settled enough for an easy ring.",
                oneThingToTry="Try a smaller FAH or VAH and aim for clear ring without adding volume.",
                retryGoal="Keep the vowel steady and resonant rather than louder.",
            )
        if metrics.brightness > 0.72:
            return Feedback(
                whatWeHeard="The vowel was likely very bright.",
                whatItOftenMeans="For this exercise, too much brightness can mean the sound is being pushed toward sharpness.",
                oneThingToTry="Keep the FAH or VAH clear, but reduce volume by a notch.",
                retryGoal="Aim for easy ring, not extra bite.",
            )
        if metrics.resonanceStability < 0.45:
            return Feedback(
                whatWeHeard="The resonance color shifted during the vowel.",
                whatItOftenMeans="That often happens when the jaw, tongue, or volume changes while sustaining.",
                oneThingToTry="Keep the mouth and volume boringly still for this retry.",
                retryGoal="Make the vowel color repeatable for a few seconds.",
            )
    elif drill_id == "hum_to_ah":
        if metrics.humToVowelContinuity is not None and metrics.humToVowelContinuity < 0.48:
            return Feedback(
                whatWeHeard="The resonance changed noticeably when the hum opened to the vowel.",
                whatItOftenMeans="Opening to ah often makes the easy hum setup disappear.",
                oneThingToTry="Open less. Keep the vowel small enough that the hum feeling can stay with it.",
                retryGoal="Aim for a connected hum-to-ah, not a bigger ah.",
            )
        if metrics.fadeAmount > 0.35:
            return Feedback(
                whatWeHeard="The sound likely lost some steadiness as it opened.",
                whatItOftenMeans="Opening from hum to vowel often makes beginners drop the easy setup.",
                oneThingToTry="Keep the hum feeling as you open to ah.",
                retryGoal="Let the vowel be small and connected.",
            )
    elif drill_id == "short_tone_hold":
        if metrics.pitchStability is not None and metrics.pitchStability < 0.5:
            return Feedback(
                whatWeHeard="The short tone likely drifted in pitch.",
                whatItOftenMeans="That often means the tone is being held with effort instead of an easy setup.",
                oneThingToTry="Choose a more comfortable pitch and hold it a little quieter.",
                retryGoal="Hold one small tone without chasing it.",
            )
        if metrics.fadeAmount > 0.38:
            return Feedback(
                whatWeHeard="The tone likely faded before the ending.",
                whatItOftenMeans="That often happens when the breath support drops before the release.",
                oneThingToTry="Make the tone shorter and finish while it still feels easy.",
                retryGoal="End cleanly before the sound collapses.",
            )
        if metrics.loudnessSteadiness < 0.48:
            return Feedback(
                whatWeHeard="The held tone likely changed size.",
                whatItOftenMeans="For this exercise, steadiness matters more than length.",
                oneThingToTry="Hold a smaller tone for fewer seconds.",
                retryGoal="Make the tone even from start to release.",
            )

    return Feedback(
        whatWeHeard="The take was usable and reasonably steady by these proxy measures.",
        whatItOftenMeans="That gives Rehear enough signal to compare one small change.",
        oneThingToTry="Repeat the same drill with an easier start and clean ending.",
        retryGoal="Do not make it bigger; make it easier to repeat.",
    )


def _feedback_ko(drill_id: DrillId, metrics: MonthOneMetrics, quality: Quality) -> Feedback:
    if quality != "usable":
        heard = {
            "too_short": f"클립이 약 {metrics.durationSec:.1f}초로 매우 짧았습니다.",
            "too_quiet": "녹음이 유용하게 분석하기에는 너무 작았을 가능성이 있습니다.",
            "clipped": "마이크가 과하게 입력되어 소리가 찌그러졌을 가능성이 있습니다.",
            "noisy": "침묵이나 주변 소음이 많아 자신 있게 판단하기 어렵습니다.",
            "unsupported": "이 녹음은 자신 있게 판단하기 어렵습니다.",
        }[quality]
        return Feedback(
            whatWeHeard=heard,
            whatItOftenMeans="보통은 비교하기 전에 더 단순하고 선명한 신호가 필요하다는 뜻입니다.",
            oneThingToTry="조용한 곳에서 휴대폰을 입에서 조금 떨어뜨리고 다시 녹음해보세요.",
            retryGoal="밀어내지 않은 작고 선명한 테이크를 남겨보세요.",
        )

    if drill_id == "sustained_hiss":
        if metrics.fadeAmount > 0.42:
            return Feedback(
                whatWeHeard="hiss의 끝부분이 약해졌을 가능성이 있습니다.",
                whatItOftenMeans="처음에 공기를 너무 많이 쓰면 이런 일이 자주 생깁니다.",
                oneThingToTry="더 작은 hiss로 시작하고 첫 1초를 차분하게 유지하세요.",
                retryGoal="더 길게가 아니라 마지막 3분의 1을 더 고르게 해보세요.",
            )
        if metrics.burstRatio > 1.45:
            return Feedback(
                whatWeHeard="시작 부분이 나머지보다 강했을 가능성이 있습니다.",
                whatItOftenMeans="공기가 일정히 풀리기보다 한 번에 빠져나간 신호일 수 있습니다.",
                oneThingToTry="공기를 절반만 쓰는 느낌으로 좁고 작은 hiss를 내보세요.",
                retryGoal="시작과 중간의 크기가 더 비슷하게 느껴지게 해보세요.",
            )
        if metrics.loudnessSteadiness < 0.45:
            return Feedback(
                whatWeHeard="공기 흐름의 크기가 흔들렸을 가능성이 있습니다.",
                whatItOftenMeans="이 호흡 훈련에서는 공기를 너무 적극적으로 조절하고 있다는 신호일 수 있습니다.",
                oneThingToTry="hiss를 더 작게 만들고 중간에 고치려 하지 말고 그대로 흘려보내세요.",
                retryGoal="하나의 단순하고 고른 공기선을 목표로 해보세요.",
            )
    elif drill_id == "gentle_hum":
        if metrics.pitchStability is not None and metrics.pitchStability < 0.45:
            return Feedback(
                whatWeHeard="허밍 안에서 음높이가 조금 움직였습니다.",
                whatItOftenMeans="작은 소리가 아직 완전히 안정되지 않았을 때 자주 보이는 신호입니다.",
                oneThingToTry="볼륨을 줄이고 가장 편한 한 음에 허밍을 얹어보세요.",
                retryGoal="작고 가만한 허밍을 몇 초 유지해보세요.",
            )
        if metrics.loudnessSteadiness < 0.46:
            return Feedback(
                whatWeHeard="허밍의 크기가 중간에 달라졌을 가능성이 있습니다.",
                whatItOftenMeans="호흡과 소리가 아직 같이 움직이지 않을 때 자주 생깁니다.",
                oneThingToTry="절반 크기로 허밍하고, 힘들어지기 전에 멈추세요.",
                retryGoal="재미없을 정도로 고른 허밍을 만들어보세요.",
            )
    elif drill_id == "soft_hum_start":
        if metrics.onsetAbruptness > 0.45:
            return Feedback(
                whatWeHeard="소리의 시작이 조금 갑작스러웠을 가능성이 있습니다.",
                whatItOftenMeans="시작이 딱딱하면 목에 힘이 더해지는 경우가 많습니다.",
                oneThingToTry="스위치를 켜듯 시작하지 말고 소리가 부드럽게 나타나게 해보세요.",
                retryGoal="첫 0.5초를 더 작고 편하게 만들어보세요.",
            )
        if metrics.burstRatio > 1.35:
            return Feedback(
                whatWeHeard="첫 순간이 나머지 허밍보다 컸을 가능성이 있습니다.",
                whatItOftenMeans="이 시작 훈련에서는 소리를 잡아채고 있다는 신호일 수 있습니다.",
                oneThingToTry="먼저 숨을 두고, 허밍이 최대한 늦고 가볍게 나타나게 해보세요.",
                retryGoal="시작이 몰래 들어오는 느낌을 만들어보세요.",
            )
    elif drill_id == "mmm_resonance":
        if metrics.pitchStability is not None and metrics.pitchStability < 0.45:
            return Feedback(
                whatWeHeard="mmm 안에서 음높이가 조금 움직였습니다.",
                whatItOftenMeans="그럴 때는 공명감을 알아차리기가 어려워집니다.",
                oneThingToTry="mmm을 더 작게 하고 한 편한 음에 머물러보세요.",
                retryGoal="입술 쪽 작은 울림을 알아차릴 만큼 안정적으로 유지해보세요.",
            )
        if metrics.resonanceScore < 0.42:
            return Feedback(
                whatWeHeard="공명 프록시 지표상 mmm의 울림이 덜 선명하게 보입니다.",
                whatItOftenMeans="허밍에 숨이 섞이거나 낮은 쪽에 치우치거나, 너무 눌려 작아졌을 때 자주 보입니다.",
                oneThingToTry="입술은 가볍게 닫고 볼륨을 키우지 않은 작은 진동을 찾아보세요.",
                retryGoal="작고 반복 가능한 mmm 울림을 찾아보세요.",
            )
        if metrics.throatEnergyRatio > 0.5 and metrics.forwardEnergyRatio < 0.12:
            return Feedback(
                whatWeHeard="스펙트럼이 낮은 쪽에 더 무게가 있었을 가능성이 있습니다.",
                whatItOftenMeans="이 mmm 훈련에서는 더 무겁고 앞으로 덜 나오는 세팅의 프록시일 수 있습니다.",
                oneThingToTry="허밍을 가볍게 하고 진동이 입술 쪽에 더 가까운 것처럼 느껴보세요.",
                retryGoal="큰 소리보다 작고 쉬운 진동을 찾아보세요.",
            )
        if metrics.resonanceStability < 0.45:
            return Feedback(
                whatWeHeard="mmm 중 울림의 색이 변했습니다.",
                whatItOftenMeans="유지하는 동안 볼륨이나 압력이 바뀔 때 자주 생깁니다.",
                oneThingToTry="이번 재시도에서는 아주 조용하고 가만한 허밍을 유지해보세요.",
                retryGoal="몇 초 동안 반복 가능한 작은 울림을 만들어보세요.",
            )
    elif drill_id == "fah_vah_resonance":
        if metrics.onsetAbruptness > 0.48:
            return Feedback(
                whatWeHeard="FAH 또는 VAH의 시작이 조금 단단했을 가능성이 있습니다.",
                whatItOftenMeans="그러면 이 훈련에서 찾는 쉬운 울림이 가려질 수 있습니다.",
                oneThingToTry="자음을 더 부드럽게 시작하고 그 뒤에 모음이 열리게 해보세요.",
                retryGoal="자음-모음이 치는 느낌이 아니라 연결되는 느낌을 목표로 해보세요.",
            )
        if metrics.resonanceScore < 0.42:
            return Feedback(
                whatWeHeard="공명 프록시 지표상 모음의 울림이 덜 선명하게 보입니다.",
                whatItOftenMeans="소리가 낮은 쪽에 치우치거나, 숨이 섞이거나, 반주에 가려지거나, 편한 울림이 아직 안정되지 않았을 때 자주 보입니다.",
                oneThingToTry="더 작은 FAH 또는 VAH로 볼륨을 키우지 말고 선명한 울림을 찾아보세요.",
                retryGoal="더 크게가 아니라 일정하고 울림 있는 모음을 목표로 해보세요.",
            )
        if metrics.brightness > 0.72:
            return Feedback(
                whatWeHeard="모음이 매우 밝게 들렸을 가능성이 있습니다.",
                whatItOftenMeans="이 훈련에서는 너무 밝은 소리가 날카롭게 밀린 신호일 수 있습니다.",
                oneThingToTry="FAH 또는 VAH를 선명하게 유지하되 볼륨을 한 단계 줄여보세요.",
                retryGoal="강한 소리보다 쉬운 울림을 목표로 해보세요.",
            )
        if metrics.resonanceStability < 0.45:
            return Feedback(
                whatWeHeard="모음 중 울림의 색이 변했습니다.",
                whatItOftenMeans="턱, 혀, 볼륨이 유지 중에 바뀔 때 자주 생깁니다.",
                oneThingToTry="이번 재시도에서는 입 모양과 볼륨을 최대한 그대로 유지해보세요.",
                retryGoal="몇 초 동안 반복 가능한 모음 색을 만들어보세요.",
            )
    elif drill_id == "hum_to_ah":
        if metrics.humToVowelContinuity is not None and metrics.humToVowelContinuity < 0.48:
            return Feedback(
                whatWeHeard="허밍에서 모음으로 열릴 때 울림이 꽤 달라졌습니다.",
                whatItOftenMeans="ah로 열면서 편한 허밍 세팅이 사라질 때 자주 생깁니다.",
                oneThingToTry="입을 덜 여세요. 허밍 느낌이 남을 만큼 작은 모음으로 해보세요.",
                retryGoal="더 큰 ah가 아니라 연결된 hum-to-ah를 목표로 해보세요.",
            )
        if metrics.fadeAmount > 0.35:
            return Feedback(
                whatWeHeard="허밍에서 모음으로 열릴 때 안정감이 조금 줄었을 가능성이 있습니다.",
                whatItOftenMeans="입을 열면서 쉬운 허밍 세팅을 놓칠 때 자주 생깁니다.",
                oneThingToTry="ah로 열어도 허밍의 편한 느낌을 유지해보세요.",
                retryGoal="모음을 작고 연결된 상태로 유지해보세요.",
            )
    elif drill_id == "short_tone_hold":
        if metrics.pitchStability is not None and metrics.pitchStability < 0.5:
            return Feedback(
                whatWeHeard="짧은 톤의 음높이가 흔들렸을 가능성이 있습니다.",
                whatItOftenMeans="쉬운 세팅보다 힘으로 붙잡고 있을 때 자주 보이는 신호입니다.",
                oneThingToTry="더 편한 음을 고르고 조금 더 조용하게 유지해보세요.",
                retryGoal="한 작은 톤을 쫓아가지 말고 그대로 유지해보세요.",
            )
        if metrics.fadeAmount > 0.38:
            return Feedback(
                whatWeHeard="끝나기 전에 톤이 약해졌을 가능성이 있습니다.",
                whatItOftenMeans="놓기 전에 호흡 지지가 먼저 사라질 때 자주 생깁니다.",
                oneThingToTry="톤을 더 짧게 만들고 아직 쉬울 때 끝내보세요.",
                retryGoal="소리가 무너지기 전에 깔끔하게 끝내보세요.",
            )
        if metrics.loudnessSteadiness < 0.48:
            return Feedback(
                whatWeHeard="유지한 톤의 크기가 바뀌었을 가능성이 있습니다.",
                whatItOftenMeans="이 훈련에서는 길이보다 안정감이 더 중요합니다.",
                oneThingToTry="더 작은 톤을 더 짧게 유지해보세요.",
                retryGoal="시작부터 놓는 순간까지 고른 톤을 만들어보세요.",
            )

    return Feedback(
        whatWeHeard="이 테이크는 분석 가능했고, 대체로 안정적인 편으로 보입니다.",
        whatItOftenMeans="한 가지 작은 변화를 비교하기에 충분한 신호입니다.",
        oneThingToTry="같은 드릴을 더 쉬운 시작과 깔끔한 끝으로 반복해보세요.",
        retryGoal="더 크게 하지 말고, 다시 하기 쉽게 만들어보세요.",
    )
