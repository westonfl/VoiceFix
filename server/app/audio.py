from pathlib import Path
import subprocess

import numpy as np


SAMPLE_RATE = 16_000


class AudioDecodeError(Exception):
    pass


def decode_audio(path: Path) -> np.ndarray:
    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(path),
        "-f",
        "f32le",
        "-acodec",
        "pcm_f32le",
        "-ac",
        "1",
        "-ar",
        str(SAMPLE_RATE),
        "pipe:1",
    ]

    try:
        result = subprocess.run(command, check=True, capture_output=True)
    except (FileNotFoundError, subprocess.CalledProcessError) as exc:
        raise AudioDecodeError("Audio could not be decoded with ffmpeg.") from exc

    samples = np.frombuffer(result.stdout, dtype=np.float32)
    if samples.size == 0:
        raise AudioDecodeError("Audio file decoded to no samples.")

    return np.nan_to_num(samples, nan=0.0, posinf=0.0, neginf=0.0)
