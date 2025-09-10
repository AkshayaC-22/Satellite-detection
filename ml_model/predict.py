import numpy as np
import cv2
import argparse
import os
from train_model import ChangeDetectionModel

def predict_change(before_path, after_path, model_path=None):
    """
    Predict changes between two satellite images
    
    Args:
        before_path: Path to the before image
        after_path: Path to the after image
        model_path: Path to trained model (optional)
    
    Returns:
        change_map: Binary change map
        change_percentage: Percentage of changed pixels
    """
    # Load or create model
    model = ChangeDetectionModel()
    if model_path and os.path.exists(model_path):
        model.load_model(model_path)
    else:
        print("Using untrained model for demonstration")
    
    # Predict changes
    change_map = model.predict(before_path, after_path)
    
    # Calculate change percentage
    change_percentage = np.mean(change_map > 0.5) * 100
    
    # Convert to binary image
    change_map_binary = (change_map > 0.5).astype(np.uint8) * 255
    
    return change_map_binary, change_percentage

def visualize_results(before_path, after_path, change_map, output_path=None):
    """
    Visualize the change detection results
    
    Args:
        before_path: Path to before image
        after_path: Path to after image
        change_map: Binary change map
        output_path: Path to save visualization (optional)
    """
    # Load images
    before_img = cv2.imread(before_path)
    after_img = cv2.imread(after_path)
    
    # Resize change map to match original images
    original_size = (before_img.shape[1], before_img.shape[0])
    change_map_resized = cv2.resize(change_map, original_size)
    
    # Create visualization
    # Overlay changes on before image
    visualization = before_img.copy()
    red_overlay = np.zeros_like(visualization)
    red_overlay[change_map_resized > 0] = [0, 0, 255]  # Red color for changes
    cv2.addWeighted(red_overlay, 0.5, visualization, 0.5, 0, visualization)
    
    # Create side-by-side comparison
    comparison = np.hstack([before_img, after_img, visualization])
    
    if output_path:
        cv2.imwrite(output_path, comparison)
        print(f"Visualization saved to {output_path}")
    
    return comparison

def main():
    parser = argparse.ArgumentParser(description='Satellite Image Change Detection')
    parser.add_argument('--before', required=True, help='Path to before image')
    parser.add_argument('--after', required=True, help='Path to after image')
    parser.add_argument('--model', help='Path to trained model')
    parser.add_argument('--output', help='Path to save output visualization')
    
    args = parser.parse_args()
    
    # Check if files exist
    if not os.path.exists(args.before):
        print(f"Error: Before image not found at {args.before}")
        return
    
    if not os.path.exists(args.after):
        print(f"Error: After image not found at {args.after}")
        return
    
    # Predict changes
    print("Detecting changes...")
    change_map, change_percentage = predict_change(args.before, args.after, args.model)
    
    print(f"Change percentage: {change_percentage:.2f}%")
    
    # Visualize results
    visualization = visualize_results(args.before, args.after, change_map, args.output)
    
    # Display results
    cv2.imshow('Change Detection Results', visualization)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()