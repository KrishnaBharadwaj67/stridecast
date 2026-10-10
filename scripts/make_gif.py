import os
from PIL import Image

FRAME_DIR = os.path.join(os.path.dirname(__file__), "..", "docs", "frames")
OUT_GIF = os.path.join(os.path.dirname(__file__), "..", "docs", "demo.gif")

def create_gif():
    ordered_names = [
        "frame_01_setup.png",
        "frame_02_generating_25.png",
        "frame_03_generating_58.png",
        "frame_04_generating_88.png",
        "frame_05_ready.png",
        "frame_06_run_idle.png",
        "frame_07_run_early.png",
        "frame_08_run_mid.png",
        "frame_09_run_coach.png",
        "frame_10_summary.png",
        "frame_11_history.png",
    ]

    images = []
    durations = [
        1800, # Setup screen pause
        1000, # Generating 25%
        1000, # Generating 58%
        1000, # Generating 88%
        1600, # Offline ready badge
        1200, # Run screen idle START
        1200, # Run screen early
        1200, # Run screen mid
        1400, # Run screen coach
        2200, # Summary route
        2200, # History list
    ]

    for name in ordered_names:
        p = os.path.join(FRAME_DIR, name)
        if os.path.exists(p):
            img = Image.open(p).convert("RGB")
            # Downsample slightly for crisp mobile display and lightweight GIF (<3 MB)
            img = img.resize((390, 844), Image.Resampling.LANCZOS)
            # Quantize with adaptive palette
            img = img.convert("P", palette=Image.Palette.ADAPTIVE, colors=128)
            images.append(img)
        else:
            print(f"Warning: frame not found: {name}")

    if images:
        images[0].save(
            OUT_GIF,
            save_all=True,
            append_images=images[1:],
            duration=durations[:len(images)],
            loop=0,
            optimize=True
        )
        size_kb = os.path.getsize(OUT_GIF) / 1024
        print(f"Created {OUT_GIF} ({size_kb:.1f} KB)")
    else:
        print("No frames available to create GIF.")

if __name__ == "__main__":
    create_gif()
