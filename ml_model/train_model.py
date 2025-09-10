import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np
import cv2
import os
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

class ChangeDetectionModel:
    def __init__(self, input_shape=(256, 256, 3)):
        self.input_shape = input_shape
        self.model = self.build_model()
        
    def build_model(self):
        """Build a U-Net like architecture for change detection"""
        # Input layer
        inputs = layers.Input(shape=self.input_shape)
        
        # Encoder
        conv1 = layers.Conv2D(64, 3, activation='relu', padding='same')(inputs)
        conv1 = layers.Conv2D(64, 3, activation='relu', padding='same')(conv1)
        pool1 = layers.MaxPooling2D(pool_size=(2, 2))(conv1)
        
        conv2 = layers.Conv2D(128, 3, activation='relu', padding='same')(pool1)
        conv2 = layers.Conv2D(128, 3, activation='relu', padding='same')(conv2)
        pool2 = layers.MaxPooling2D(pool_size=(2, 2))(conv2)
        
        # Middle
        conv3 = layers.Conv2D(256, 3, activation='relu', padding='same')(pool2)
        conv3 = layers.Conv2D(256, 3, activation='relu', padding='same')(conv3)
        
        # Decoder
        up4 = layers.UpSampling2D(size=(2, 2))(conv3)
        up4 = layers.Conv2D(128, 2, activation='relu', padding='same')(up4)
        merge4 = layers.concatenate([conv2, up4], axis=3)
        conv4 = layers.Conv2D(128, 3, activation='relu', padding='same')(merge4)
        conv4 = layers.Conv2D(128, 3, activation='relu', padding='same')(conv4)
        
        up5 = layers.UpSampling2D(size=(2, 2))(conv4)
        up5 = layers.Conv2D(64, 2, activation='relu', padding='same')(up5)
        merge5 = layers.concatenate([conv1, up5], axis=3)
        conv5 = layers.Conv2D(64, 3, activation='relu', padding='same')(merge5)
        conv5 = layers.Conv2D(64, 3, activation='relu', padding='same')(conv5)
        
        # Output
        outputs = layers.Conv2D(1, 1, activation='sigmoid')(conv5)
        
        model = models.Model(inputs=inputs, outputs=outputs)
        
        model.compile(optimizer='adam',
                     loss='binary_crossentropy',
                     metrics=['accuracy'])
        
        return model
    
    def preprocess_images(self, image_paths):
        """Preprocess images for model input"""
        processed_images = []
        for path in image_paths:
            img = cv2.imread(path)
            img = cv2.resize(img, (self.input_shape[0], self.input_shape[1]))
            img = img / 255.0  # Normalize
            processed_images.append(img)
        return np.array(processed_images)
    
    def create_change_maps(self, before_images, after_images):
        """Create change maps from before and after images"""
        # Simple difference for demonstration
        # In practice, you'd use more sophisticated methods
        change_maps = np.abs(before_images - after_images)
        change_maps = np.mean(change_maps, axis=-1, keepdims=True)
        change_maps = (change_maps > 0.1).astype(np.float32)  # Threshold
        return change_maps
    
    def train(self, before_image_paths, after_image_paths, epochs=50, batch_size=8):
        """Train the change detection model"""
        # Preprocess images
        before_images = self.preprocess_images(before_image_paths)
        after_images = self.preprocess_images(after_image_paths)
        
        # Create change maps (labels)
        change_maps = self.create_change_maps(before_images, after_images)
        
        # Prepare input (concatenate before and after images)
        X = np.concatenate([before_images, after_images], axis=-1)
        y = change_maps
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            batch_size=batch_size,
            epochs=epochs,
            validation_data=(X_val, y_val),
            verbose=1
        )
        
        return history
    
    def predict(self, before_image_path, after_image_path):
        """Predict change map for a pair of images"""
        # Preprocess images
        before_img = self.preprocess_images([before_image_path])[0]
        after_img = self.preprocess_images([after_image_path])[0]
        
        # Prepare input
        X = np.concatenate([before_img, after_img], axis=-1)
        X = np.expand_dims(X, axis=0)
        
        # Predict
        prediction = self.model.predict(X)[0]
        
        return prediction
    
    def save_model(self, filepath):
        """Save the trained model"""
        self.model.save(filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load a trained model"""
        self.model = models.load_model(filepath)
        print(f"Model loaded from {filepath}")

def main():
    # Example usage
    model = ChangeDetectionModel()
    
    # For demonstration, we'll create some dummy data
    # In practice, you'd load your actual satellite image pairs
    print("Building model...")
    print(model.model.summary())
    
    # Example of how to train with real data:
    # before_images = ["path/to/before1.jpg", "path/to/before2.jpg", ...]
    # after_images = ["path/to/after1.jpg", "path/to/after2.jpg", ...]
    # history = model.train(before_images, after_images, epochs=50)
    
    # Save model
    # model.save_model("change_detection_model.h5")

if __name__ == "__main__":
    main()