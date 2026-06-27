import sys
import os

# Dynamically add user site-packages directories to path to ensure compatibility across all shell environments
user_profile = os.environ.get('USERPROFILE', 'C:\\Users\\PC')
appdata = os.environ.get('APPDATA', os.path.join(user_profile, 'AppData', 'Roaming'))
localappdata = os.environ.get('LOCALAPPDATA', os.path.join(user_profile, 'AppData', 'Local'))

paths_to_add = [
    # Windows Store Python 3.11
    os.path.join(localappdata, 'Packages', 'PythonSoftwareFoundation.Python.3.11_qbz5n2kfra8p0', 'LocalCache', 'local-packages', 'Python311', 'site-packages'),
    # Windows Store Python 3.12
    os.path.join(localappdata, 'Packages', 'PythonSoftwareFoundation.Python.3.12_qbz5n2kfra8p0', 'LocalCache', 'local-packages', 'Python312', 'site-packages'),
    # Standard user site-packages
    os.path.join(appdata, 'Python', 'Python311', 'site-packages'),
    os.path.join(appdata, 'Python', 'Python312', 'site-packages'),
    os.path.join(appdata, 'Python', 'Python313', 'site-packages'),
    # Standard Python installations
    os.path.join(localappdata, 'Programs', 'Python', 'Python313', 'Lib', 'site-packages'),
    os.path.join(localappdata, 'Programs', 'Python', 'Python312', 'Lib', 'site-packages'),
    os.path.join(localappdata, 'Programs', 'Python', 'Python311', 'Lib', 'site-packages'),
]

for p in paths_to_add:
    if os.path.isdir(p) and p not in sys.path:
        sys.path.append(p)

import glob
import re
from pptx import Presentation
from pptx.util import Inches
from PIL import Image

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

def pdf_pages_to_pptx(images_dir, output_pptx):
    # Find all png/jpg images in the directory
    extensions = ('*.png', '*.jpg', '*.jpeg')
    images = []
    for ext in extensions:
        images.extend(glob.glob(os.path.join(images_dir, ext)))
    
    # Sort them naturally
    images.sort(key=natural_sort_key)
    
    if not images:
        print("No page images found to convert.")
        sys.exit(1)
        
    prs = Presentation()
    blank_slide_layout = prs.slide_layouts[6] # Blank slide layout
    
    # Set slide dimensions based on the first page image
    first_image = Image.open(images[0])
    img_w, img_h = first_image.size
    
    # Convert pixels to Inches for slide dimensions (assuming 150 DPI)
    dpi = 150
    prs.slide_width = Inches(img_w / dpi)
    prs.slide_height = Inches(img_h / dpi)
    
    for img_path in images:
        slide = prs.slides.add_slide(blank_slide_layout)
        # Add full bleed picture matching slide size
        slide.shapes.add_picture(img_path, 0, 0, width=prs.slide_width, height=prs.slide_height)
        
    prs.save(output_pptx)
    print(f"Presentation saved successfully to: {output_pptx}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python pdf_to_pptx.py <images_directory> <output_pptx_path>")
        sys.exit(1)
    pdf_pages_to_pptx(sys.argv[1], sys.argv[2])
