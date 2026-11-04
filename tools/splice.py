"""Replace the broken stretch (source frames 63-77) of the desk film with frames from a bridge clip.

Usage: python3 tools/splice.py <bridge.mp4> <aspect 16x9|9x16> <source seq dir> <out dir>

The bridge clip starts on source frame 62 and ends on 78. Its first and last frames must match
those (SSIM >= 0.95) or nothing is written. Writes the full 373-frame source sequence to <out dir>
with 63-77 replaced by 15 evenly spaced frames from inside the clip.
"""
import shutil, subprocess, sys, tempfile
from pathlib import Path

clip, aspect, src, out = sys.argv[1], sys.argv[2], Path(sys.argv[3]), Path(sys.argv[4])
W, H = (1924, 1076) if aspect == "16x9" else (1076, 1924)
tmp = Path(tempfile.mkdtemp())

# Every clip frame, scaled and centre-cropped to the sequence size.
vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"
subprocess.run(["ffmpeg", "-loglevel", "error", "-i", clip, "-vf", vf, str(tmp / "c%04d.png")], check=True)
frames = sorted(tmp.glob("c*.png"))
n = len(frames)
assert n >= 20, f"clip has only {n} frames"

def ssim(a, b):
    r = subprocess.run(["ffmpeg", "-i", str(a), "-i", str(b), "-lavfi", "ssim", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    return float(r.split("All:")[1].split()[0])

def png(i):
    p = tmp / f"s{i:03d}.png"
    subprocess.run(["dwebp", "-quiet", str(src / f"{i:03d}.webp"), "-o", str(p)], check=True)
    return p

head, tail = ssim(frames[0], png(62)), ssim(frames[-1], png(78))
print(f"{aspect}: {n} clip frames, seam 62 SSIM {head:.3f}, seam 78 SSIM {tail:.3f}")
if min(head, tail) < 0.95:
    sys.exit("seam check failed: nothing written")

out.mkdir(parents=True, exist_ok=True)
for i in range(373):
    if not 63 <= i <= 77:
        shutil.copy(src / f"{i:03d}.webp", out / f"{i:03d}.webp")
for k, i in enumerate(range(63, 78), start=1):
    f = frames[round(k * (n - 1) / 16)]  # 15 interior frames, evenly spaced
    subprocess.run(["cwebp", "-quiet", "-q", "72", "-m", "6", str(f), "-o", str(out / f"{i:03d}.webp")], check=True)
print(f"wrote 373 frames to {out}")
