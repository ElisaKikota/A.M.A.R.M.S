import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import { 
  User, 
  Shield, 
  AlertCircle,
  Save,
  Edit2,
  X,
  Plus,
  Trash2,
  Code,
  Upload,
  Camera
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Select from 'react-select';
import AdminSection from '../components/settings/AdminSection';

// Predefined list of skills related to robotics, 3D, IoT and software
const skillOptions = [
  // Robotics category
  { value: 'robot_programming', label: 'Robot Programming', category: 'Robotics' },
  { value: 'robot_vision', label: 'Robot Vision Systems', category: 'Robotics' },
  { value: 'robot_kinematics', label: 'Robot Kinematics', category: 'Robotics' },
  { value: 'robot_control', label: 'Robot Control Systems', category: 'Robotics' },
  { value: 'robot_simulation', label: 'Robot Simulation', category: 'Robotics' },
  { value: 'ros', label: 'ROS (Robot Operating System)', category: 'Robotics' },
  { value: 'drone_development', label: 'Drone Development', category: 'Robotics' },
  
  // 3D category
  { value: 'cad_design', label: 'CAD Design', category: '3D' },
  { value: '3d_modeling', label: '3D Modeling', category: '3D' },
  { value: '3d_printing', label: '3D Printing', category: '3D' },
  { value: 'blender', label: 'Blender', category: '3D' },
  { value: 'unity3d', label: 'Unity 3D', category: '3D' },
  { value: 'unreal_engine', label: 'Unreal Engine', category: '3D' },
  { value: 'ar_vr', label: 'AR/VR Development', category: '3D' },
  
  // IoT category
  { value: 'embedded_systems', label: 'Embedded Systems', category: 'IoT' },
  { value: 'sensor_integration', label: 'Sensor Integration', category: 'IoT' },
  { value: 'microcontrollers', label: 'Microcontrollers (Arduino, ESP32)', category: 'IoT' },
  { value: 'iot_protocols', label: 'IoT Protocols (MQTT, CoAP)', category: 'IoT' },
  { value: 'raspberry_pi', label: 'Raspberry Pi', category: 'IoT' },
  { value: 'pcb_design', label: 'PCB Design', category: 'IoT' },
  { value: 'hardware_prototyping', label: 'Hardware Prototyping', category: 'IoT' },
  
  // Software Development
  { value: 'web_frontend', label: 'Web Frontend Development', category: 'Software' },
  { value: 'web_backend', label: 'Web Backend Development', category: 'Software' },
  { value: 'mobile_dev', label: 'Mobile App Development', category: 'Software' },
  { value: 'python', label: 'Python', category: 'Software' },
  { value: 'javascript', label: 'JavaScript', category: 'Software' },
  { value: 'cpp', label: 'C/C++', category: 'Software' },
  { value: 'machine_learning', label: 'Machine Learning', category: 'Software' },
  { value: 'computer_vision', label: 'Computer Vision', category: 'Software' },
  { value: 'cloud_services', label: 'Cloud Services', category: 'Software' },
  { value: 'devops', label: 'DevOps', category: 'Software' },
  { value: 'database', label: 'Database Management', category: 'Software' },
  
  // PR (Public Relations) category
  { value: 'media_relations', label: 'Media Relations', category: 'PR' },
  { value: 'crisis_management', label: 'Crisis Management', category: 'PR' },
  { value: 'press_releases', label: 'Press Release Writing', category: 'PR' },
  { value: 'public_speaking', label: 'Public Speaking', category: 'PR' },
  { value: 'event_planning', label: 'Event Planning & Coordination', category: 'PR' },
  { value: 'community_engagement', label: 'Community Engagement', category: 'PR' },
  { value: 'stakeholder_relations', label: 'Stakeholder Relations', category: 'PR' },
  { value: 'brand_reputation', label: 'Brand Reputation Management', category: 'PR' },
  
  // Marketing category
  { value: 'digital_marketing', label: 'Digital Marketing', category: 'Marketing' },
  { value: 'social_media', label: 'Social Media Marketing', category: 'Marketing' },
  { value: 'content_creation', label: 'Content Creation', category: 'Marketing' },
  { value: 'seo', label: 'SEO (Search Engine Optimization)', category: 'Marketing' },
  { value: 'email_marketing', label: 'Email Marketing', category: 'Marketing' },
  { value: 'market_research', label: 'Market Research & Analysis', category: 'Marketing' },
  { value: 'branding', label: 'Branding Strategy', category: 'Marketing' },
  { value: 'analytics', label: 'Marketing Analytics', category: 'Marketing' },
  { value: 'campaign_management', label: 'Campaign Management', category: 'Marketing' },
  
  // Graphics category
  { value: 'photoshop', label: 'Adobe Photoshop', category: 'Graphics' },
  { value: 'capcut', label: 'CapCut', category: 'Graphics' },
  { value: 'illustrator', label: 'Adobe Illustrator', category: 'Graphics' },
  { value: 'indesign', label: 'Adobe InDesign', category: 'Graphics' },
  { value: 'after_effects', label: 'Adobe After Effects', category: 'Graphics' },
  { value: 'premiere_pro', label: 'Adobe Premiere Pro', category: 'Graphics' },
  { value: 'graphic_design', label: 'Graphic Design', category: 'Graphics' },
  { value: 'ui_design', label: 'UI Design', category: 'Graphics' },
  { value: 'motion_graphics', label: 'Motion Graphics', category: 'Graphics' },
  { value: 'video_editing', label: 'Video Editing', category: 'Graphics' },
  { value: 'photography', label: 'Photography', category: 'Graphics' },
  
  // Leadership category
  { value: 'team_management', label: 'Team Management', category: 'Leadership' },
  { value: 'project_management', label: 'Project Management', category: 'Leadership' },
  { value: 'strategic_planning', label: 'Strategic Planning', category: 'Leadership' },
  { value: 'decision_making', label: 'Decision Making', category: 'Leadership' },
  { value: 'conflict_resolution', label: 'Conflict Resolution', category: 'Leadership' },
  { value: 'delegation', label: 'Effective Delegation', category: 'Leadership' },
  { value: 'mentoring', label: 'Mentoring & Coaching', category: 'Leadership' },
  { value: 'change_management', label: 'Change Management', category: 'Leadership' },
  { value: 'emotional_intelligence', label: 'Emotional Intelligence', category: 'Leadership' },
  
  // Other Skills category
  { value: 'languages', label: 'Foreign Languages', category: 'Other' },
  { value: 'technical_writing', label: 'Technical Writing', category: 'Other' },
  { value: 'presentation', label: 'Presentation Skills', category: 'Other' },
  { value: 'research', label: 'Research Methods', category: 'Other' },
  { value: 'data_analysis', label: 'Data Analysis', category: 'Other' },
  { value: 'critical_thinking', label: 'Critical Thinking', category: 'Other' },
  { value: 'time_management', label: 'Time Management', category: 'Other' },
  { value: 'problem_solving', label: 'Problem Solving', category: 'Other' },
  { value: 'collaboration', label: 'Collaboration & Teamwork', category: 'Other' }
];

// Custom styles for the select component
const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: 'none',
    '&:hover': {
      border: '1px solid #90cdf4',
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#3b82f6' 
      : state.isFocused 
        ? '#eff6ff' 
        : null,
    color: state.isSelected ? 'white' : '#1f2937',
  }),
  groupHeading: (provided) => ({
    ...provided,
    fontWeight: 'bold',
    fontSize: '0.8rem',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: '#f9fafb',
    padding: '0.5rem 1rem',
  }),
};

// Formatter for the proficiency badges
const ProficiencyBadge = ({ proficiency }) => {
  const colors = {
    beginner: 'bg-blue-100 text-blue-800',
    intermediate: 'bg-green-100 text-green-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[proficiency]}`}>
      {proficiency.charAt(0).toUpperCase() + proficiency.slice(1)}
    </span>
  );
};

const ProfilePictureModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  // Center the image when first loaded
  useEffect(() => {
    if (selectedFile && imageRef.current && containerRef.current) {
      // Reset to default values first
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      
      // Create an image for measuring
      const img = new Image();
      img.onload = () => {      
        // Determine if we need to adjust the initial position based on aspect ratio
        const imageAspect = img.width / img.height;
        
        // Initial zoom depends on image shape
        let initialZoom = 1;
        
        // For portrait/landscape images, start with a zoom that shows more of the face
        if (imageAspect < 0.8) { // Tall portrait image
          initialZoom = 1.3;
        } else if (imageAspect > 1.5) { // Wide landscape image
          initialZoom = 1.2;
        }
        
        // Apply initial zoom and centering
        setZoom(initialZoom);
        
        // For portrait images, shift up slightly to center the face
        if (imageAspect < 1) {
          // Move image up a bit to center face for portrait images
          setCrop({ x: 0, y: -20 });
        } else {
          // Center position for landscape or square images
          setCrop({ x: 0, y: 0 });
        }
      };
      img.src = URL.createObjectURL(selectedFile);
    }
  }, [selectedFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('File selected in handleFileChange:', file);
    
    if (!file) {
      console.warn('No file selected');
      setSelectedFile(null);
      return;
    }
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      setSelectedFile(null);
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    console.log('Selected file set:', file.name);
  };

  
  const handleUpload = async () => {
    console.log('Upload button clicked, selectedFile:', selectedFile);
    
    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      setLoading(true);
      console.log('Uploading file with crop position:', crop);
      console.log('Using zoom level:', zoom);
      
      // Process the image with canvas to apply the crop and zoom
      const processedFile = await processImage(selectedFile, crop, zoom);
      
      console.log('Image processed, uploading...');
      await onUpload(processedFile);
      console.log('Upload function completed');
      
      // Reset loading state here
      setLoading(false);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload image');
      setLoading(false);
    }
  };

  // Function to process the image with canvas
  const processImage = (file, crop, zoom) => {
    return new Promise((resolve, reject) => {
      try {
        // Create an image element to load the file
        const img = new Image();
        img.onload = () => {
          console.log(`Original image dimensions: ${img.width}x${img.height}`);
          console.log(`Crop position: ${crop.x}, ${crop.y}, Zoom: ${zoom}`);
          
          // Create a canvas element
          const canvas = document.createElement('canvas');
          const outputSize = 500; // Fixed output size
          canvas.width = outputSize;
          canvas.height = outputSize;
          const ctx = canvas.getContext('2d');
          
          // Create a circular clipping path
          ctx.beginPath();
          ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Fill with white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, outputSize, outputSize);
          
          // Get preview container dimensions - the w-64 class is 16rem = 256px
          const containerSize = 256;
          
          // Determine if this is a wide or tall image
          const imageAspect = img.width / img.height;
          let displayWidth, displayHeight;
          
          if (imageAspect > 1) {
            // Wide image
            displayHeight = containerSize;
            displayWidth = displayHeight * imageAspect;
          } else {
            // Tall image
            displayWidth = containerSize;
            displayHeight = displayWidth / imageAspect;
          }
          
          // Calculate the scale factor between original image and how it's displayed
          const scaleX = img.width / displayWidth;
          const scaleY = img.height / displayHeight;
          
          // Calculate offsets for centering the image in the container
          const offsetX = (containerSize - displayWidth) / 2;
          const offsetY = (containerSize - displayHeight) / 2;
          
          // Calculate the center of the visible area in the preview
          // Note: We negate crop values because moving the image right (positive crop.x)
          // means we want to show more of the left side of the image
          const visibleCenterX = (containerSize / 2) - crop.x;
          const visibleCenterY = (containerSize / 2) - crop.y;
          
          // Convert visible center to image coordinates
          let imageCenterX, imageCenterY;
          
          // Adjust for the offset when the image doesn't fully cover the container
          imageCenterX = (visibleCenterX - offsetX) * scaleX;
          imageCenterY = (visibleCenterY - offsetY) * scaleY;
          
          // Calculate the size of the area to crop based on zoom level
          const cropSizeInContainer = containerSize / zoom;
          const cropSizeInImage = cropSizeInContainer * scaleX;
          
          // Calculate the source rectangle (with bounds checking)
          let sourceX = Math.max(0, imageCenterX - (cropSizeInImage / 2));
          let sourceY = Math.max(0, imageCenterY - (cropSizeInImage / 2));
          let sourceWidth = Math.min(img.width - sourceX, cropSizeInImage);
          let sourceHeight = Math.min(img.height - sourceY, cropSizeInImage);
          
          // Adjust sourceHeight to match sourceWidth to maintain aspect ratio
          if (sourceWidth !== sourceHeight) {
            // Use the smaller dimension to ensure we don't exceed image bounds
            const sourceDimension = Math.min(sourceWidth, sourceHeight);
            sourceWidth = sourceDimension;
            sourceHeight = sourceDimension;
          }
          
          // Ensure we're still centered on the target point
          sourceX = Math.max(0, imageCenterX - (sourceWidth / 2));
          sourceY = Math.max(0, imageCenterY - (sourceHeight / 2));
          
          // Make sure we're not trying to read past the image boundaries
          if (sourceX + sourceWidth > img.width) {
            sourceX = img.width - sourceWidth;
          }
          if (sourceY + sourceHeight > img.height) {
            sourceY = img.height - sourceHeight;
          }
          
          console.log(`Display dimensions: ${displayWidth}x${displayHeight}, Offset: ${offsetX},${offsetY}`);
          console.log(`Image center: ${imageCenterX},${imageCenterY}`);
          console.log(`Final source rectangle: ${sourceX},${sourceY},${sourceWidth},${sourceHeight}`);
          
          // Draw the image
          ctx.drawImage(
            img,
            sourceX, sourceY,
            sourceWidth, sourceHeight,
            0, 0,
            outputSize, outputSize
          );
          
          // Convert the canvas to a Blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a new File object from the Blob
              const processedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
              });
              resolve(processedFile);
            } else {
              reject(new Error('Failed to process image'));
            }
          }, 'image/jpeg', 0.95); // Higher quality JPEG
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Load the image from the file
        img.src = URL.createObjectURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e) => {
    if (!selectedFile) return;
    
    e.preventDefault();
    
    // Get the current container dimensions
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Get the mouse position relative to the container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Get the mouse position relative to the image's transformed position
    const mouseRelativeX = mouseX - crop.x;
    const mouseRelativeY = mouseY - crop.y;
    
    // Determine zoom direction and amount
    const delta = e.deltaY < 0 ? 0.1 : -0.1; // Up = zoom in, Down = zoom out
    
    // Calculate new zoom level with limits
    const newZoom = Math.max(1, Math.min(3, zoom + delta));
    const zoomChange = newZoom / zoom;
    
    if (Math.abs(newZoom - zoom) > 0.01) {
      // When zooming, adjust position to keep the point under the cursor fixed
      const newCropX = mouseX - mouseRelativeX * zoomChange;
      const newCropY = mouseY - mouseRelativeY * zoomChange;
      
      // Apply the new zoom and crop position
      setZoom(newZoom);
      setCrop({
        x: newCropX,
        y: newCropY
      });
    }
  }, [selectedFile, crop, zoom]);

  // Handle mouse drag for positioning
  const handleMouseDown = useCallback((e) => {
    if (!selectedFile) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y
    });
  }, [selectedFile, crop]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    setCrop({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle touch pinch for zoom (touch devices)
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
    
    // Store initial distance for pinch calculation
    containerRef.current.dataset.initialPinchDistance = distance;
    containerRef.current.dataset.initialZoom = zoom;
  }, [zoom]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length !== 2 || !containerRef.current.dataset.initialPinchDistance) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );
    
    const initialDistance = parseFloat(containerRef.current.dataset.initialPinchDistance);
    const initialZoom = parseFloat(containerRef.current.dataset.initialZoom);
    
    if (distance && initialDistance) {
      // Calculate zoom factor based on pinch gesture
      const scale = distance / initialDistance;
      const newZoom = Math.max(1, Math.min(3, initialZoom * scale));
      setZoom(newZoom);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (containerRef.current) {
      delete containerRef.current.dataset.initialPinchDistance;
      delete containerRef.current.dataset.initialZoom;
    }
  }, []);

  // Handle touch drag for positioning
  const handleTouchStart2 = useCallback((e) => {
    if (!selectedFile || e.touches.length !== 1) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - crop.x,
      y: e.touches[0].clientY - crop.y
    });
  }, [selectedFile, crop]);

  const handleTouchMove2 = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    setCrop({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd2 = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for mouse and touch events
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !selectedFile) return;
    
    // Mouse wheel event for zoom
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    // Mouse events for drag
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Touch events for pinch zoom
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);
    
    // Touch events for drag
    container.addEventListener('touchstart', handleTouchStart2);
    container.addEventListener('touchmove', handleTouchMove2);
    container.addEventListener('touchend', handleTouchEnd2);
    
    return () => {
      // Clean up event listeners
      container.removeEventListener('wheel', handleWheel);
      
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      
      container.removeEventListener('touchstart', handleTouchStart2);
      container.removeEventListener('touchmove', handleTouchMove2);
      container.removeEventListener('touchend', handleTouchEnd2);
    };
  }, [
    selectedFile, 
    isDragging, 
    dragStart, 
    crop, 
    zoom, 
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchStart2,
    handleTouchMove2,
    handleTouchEnd2
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Update Profile Picture</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <div 
                ref={containerRef}
                className="relative w-64 h-64 rounded-full overflow-hidden mb-4 border-2 border-gray-200 cursor-move"
                style={{ touchAction: 'none' }}
              >
                <div 
                  ref={imageRef}
                  className="absolute inset-0 transition-transform duration-100"
                  style={{ 
                    transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                    backgroundImage: `url(${URL.createObjectURL(selectedFile)})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-full border-4 border-white rounded-full opacity-60"></div>
                </div>
              </div>
              
              <div className="w-full space-y-4">
                <p className="text-sm text-gray-600 mb-2 text-center">
                  {selectedFile.name}
                </p>
                
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    <span className="font-medium">How to use:</span>
                  </div>
                  <ul className="ml-5 list-disc space-y-1">
                    <li>Drag the image to position it</li>
                    <li>Use mouse wheel to zoom in/out</li>
                    <li>On mobile, pinch to zoom and drag to position</li>
                  </ul>
                </div>
                
                {/* Zoom Control - Keep as optional/alternative control */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Zoom</span>
                    <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-red-600 text-sm hover:text-red-700 w-full mt-2"
                >
                  Remove Selected Image
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-1">Click to select an image</p>
              <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 5MB</p>
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={!selectedFile || loading}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { user, updateUserProfile, updateProfilePicture } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);
  const [profilePhotoURL, setProfilePhotoURL] = useState(user?.photoURL);
  
  // Update profilePhotoURL when user changes
  useEffect(() => {
    if (user?.photoURL) {
      setProfilePhotoURL(user.photoURL);
    }
  }, [user]);
  
  // Refs for input fields to maintain focus
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const bioInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    skills: user?.skills || []
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user?.twoFactorEnabled || false
  });

  const [newSkill, setNewSkill] = useState({ name: '', value: '', proficiency: 'beginner' });
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Function to normalize category names for comparison
  const normalizeCategory = (category) => {
    if (!category) return '';
    // Convert to lowercase and handle special cases
    return category.toLowerCase() === '3d' ? '3d' : category.toLowerCase();
  };
  
  // Function to handle category selection
  const handleCategorySelect = (categoryOption) => {
    setSelectedCategory(categoryOption);
    // Reset selected skill when category changes
    setSelectedSkill(null);
    setNewSkill({ name: '', value: '', proficiency: 'beginner' });
  };
  
  // Create category options for first dropdown
  const categoryOptions = [
    { value: 'robotics', label: 'Robotics' },
    { value: '3d', label: '3D' },
    { value: 'iot', label: 'IoT' },
    { value: 'software', label: 'Software Development' },
    { value: 'pr', label: 'Public Relations (PR)' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'graphics', label: 'Graphics' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'other', label: 'Other Skills' }
  ];
  
  // Function to add a new skill
  const handleAddSkill = () => {
    if (!newSkill.name) {
      toast.error('Please select a skill');
      return;
    }
    
    // Check if skill already exists
    if (profileData.skills.some(skill => 
      skill.value === newSkill.value || 
      skill.name.toLowerCase() === newSkill.name.toLowerCase()
    )) {
      toast.error('This skill already exists in your profile');
      return;
    }
    
    const updatedSkills = [
      ...profileData.skills,
      { 
        id: Date.now().toString(), // Generate a unique ID
        value: newSkill.value,     // Store the skill value for future reference
        name: newSkill.name,
        proficiency: newSkill.proficiency,
        category: selectedCategory.value // Store the category
      }
    ];
    
    setProfileData(prevData => ({
      ...prevData,
      skills: updatedSkills
    }));
    
    toast.success(`${newSkill.name} skill added`);
    
    // Reset the form completely
    setNewSkill({ name: '', value: '', proficiency: 'beginner' });
    setSelectedSkill(null);
    setSelectedCategory(null); // Clear the category selection
  };
  
  // Function to remove a skill
  const handleRemoveSkill = (skillId) => {
    const updatedSkills = profileData.skills.filter(skill => skill.id !== skillId);
    setProfileData(prevData => ({
      ...prevData,
      skills: updatedSkills
    }));
  };
  
  // Function to update skill proficiency
  const handleUpdateSkillProficiency = (skillId, newProficiency) => {
    const updatedSkills = profileData.skills.map(skill => 
      skill.id === skillId ? { ...skill, proficiency: newProficiency } : skill
    );
    
    setProfileData(prevData => ({
      ...prevData,
      skills: updatedSkills
    }));
  };

  // Handle profile save
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateUserProfile(user.uid, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
        skills: profileData.skills,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setProfileData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = async (file) => {
    if (!file) {
      toast.error('Please select a profile picture');
      return;
    }
    
    try {
      setLoading(true);
      
      // Upload the processed image
      const photoURL = await updateProfilePicture(file);
      
      // Update the profile photo URL in the state
      setProfilePhotoURL(photoURL);
      
      // Show success message
      toast.success('Profile picture updated successfully');
      
      // Close the modal
      setIsProfilePictureModalOpen(false);
      
      return photoURL;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to update profile picture');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Render the profile settings section
  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Profile Information</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          {isEditing ? (
            <>
              <X size={16} />
              Cancel Editing
            </>
          ) : (
            <>
              <Edit2 size={16} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {/* Profile Picture */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {profilePhotoURL ? (
                <img
                  src={`${profilePhotoURL}?t=${Date.now()}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  key={profilePhotoURL}
                />
              ) : (
                <User size={36} className="text-gray-400" />
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => setIsProfilePictureModalOpen(true)}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
              >
                <Camera size={16} />
              </button>
            )}
          </div>
          <div>
            <p className="font-medium">{user?.displayName || user?.name || 'User'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {isEditing && (
              <button
                onClick={() => setIsProfilePictureModalOpen(true)}
                className="text-blue-600 hover:text-blue-700 text-sm mt-1"
              >
                Change Profile Picture
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            ref={nameInputRef}
            type="text"
            value={profileData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            ref={emailInputRef}
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            ref={phoneInputRef}
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            ref={bioInputRef}
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={!isEditing}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Skills Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Skills</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Code size={16} className="mr-1" />
              {profileData.skills.length} {profileData.skills.length === 1 ? 'skill' : 'skills'} listed
            </div>
          </div>
          
          {/* Skills List */}
          <div className="space-y-4">
            {profileData.skills.length === 0 && !isEditing ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No skills added yet</p>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Edit profile to add skills
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profileData.skills.map(skill => (
                  <div 
                    key={skill.id} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{skill.name}</p>
                        {skill.category && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
                          </span>
                        )}
                      </div>
                      {isEditing ? (
                        <select
                          value={skill.proficiency}
                          onChange={(e) => handleUpdateSkillProficiency(skill.id, e.target.value)}
                          className="mt-1 text-sm p-1 border rounded"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      ) : (
                        <ProficiencyBadge proficiency={skill.proficiency} />
                      )}
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove skill"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Skill Form */}
            {isEditing && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium mb-3">Add New Skill</h4>
                <div className="flex flex-col gap-3">
                  {/* Step 1: Category Selection */}
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">
                      Select Category
                    </label>
                    <Select
                      placeholder="Select a category..."
                      options={categoryOptions}
                      styles={customSelectStyles}
                      value={selectedCategory}
                      onChange={handleCategorySelect}
                      className="category-select"
                    />
                  </div>
                  
                  {/* Step 2: Skill Selection (only appears after category is selected) */}
                  {selectedCategory && (
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">
                        Select Skill in {selectedCategory.label}
                      </label>
                      <Select
                        placeholder={`Select a ${selectedCategory.label.toLowerCase()} skill...`}
                        options={skillOptions.filter(skill => 
                          normalizeCategory(skill.category) === selectedCategory.value
                        )}
                        styles={customSelectStyles}
                        value={selectedSkill}
                        onChange={(selected) => {
                          if (selected) {
                            setSelectedSkill(selected);
                            setNewSkill({ 
                              ...newSkill, 
                              name: selected.label,
                              value: selected.value
                            });
                          }
                        }}
                        className="skill-select"
                        isSearchable={true}
                      />
                    </div>
                  )}
                  
                  <div className="flex sm:flex-row gap-3">
                    <select
                      value={newSkill.proficiency}
                      onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                      disabled={!selectedSkill}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center w-full sm:w-auto"
                      disabled={!newSkill.name}
                    >
                      <Plus size={16} className="mr-1" />
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? 'Saving...' : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  // Security Section
  const SecuritySettings = () => {
    // Refs for password fields
    const currentPasswordRef = useRef(null);
    const newPasswordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    
    // Local state for this component to handle inputs properly
    const [localSecurityData, setLocalSecurityData] = useState({
      currentPassword: securityData.currentPassword,
      newPassword: securityData.newPassword,
      confirmPassword: securityData.confirmPassword
    });

    // Local loading state for smoother UI updates
    const [localLoading, setLocalLoading] = useState(false);

    // Sync the local state with parent state when securityData changes
    useEffect(() => {
      if (!localLoading) {
        setLocalSecurityData({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
          confirmPassword: securityData.confirmPassword
        });
      }
    }, [localLoading]);

    // Handle input changes locally first
    const handleSecurityInputChange = (field, value) => {
      setLocalSecurityData(prev => ({
        ...prev,
        [field]: value
      }));
    };
    
    // Local password change handler
    const handleLocalPasswordChange = async () => {
      try {
        // Validate inputs
        if (!localSecurityData.currentPassword) {
          toast.error('Please enter your current password');
          currentPasswordRef.current?.focus();
          return;
        }
        
        if (!localSecurityData.newPassword) {
          toast.error('Please enter a new password');
          newPasswordRef.current?.focus();
          return;
        }
        
        if (localSecurityData.newPassword !== localSecurityData.confirmPassword) {
          toast.error('New passwords do not match');
          confirmPasswordRef.current?.focus();
          return;
        }

        // Start loading state
        setLocalLoading(true);
        setLoading(true);
        
        // Create a local copy of the data to pass to Firebase
        const passwordData = {
          currentPassword: localSecurityData.currentPassword,
          newPassword: localSecurityData.newPassword
        };
        
        // Pass the data to updateUserProfile function
        await updateUserProfile(user.uid, passwordData);
        
        // Reset the form after successful update
        setLocalSecurityData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Update parent state
        setSecurityData({
          ...securityData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Error changing password:', error);
        toast.error(error.message || 'Failed to update password');
      } finally {
        setLocalLoading(false);
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Security Settings</h3>

        <div className="space-y-4">
          {/* Change Password */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-4">Change Password</h4>
            <div className="space-y-4">
              <div>
                <input
                  ref={currentPasswordRef}
                  type="password"
                  placeholder="Current Password"
                  value={localSecurityData.currentPassword}
                  onChange={(e) => handleSecurityInputChange('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <input
                  ref={newPasswordRef}
                  type="password"
                  placeholder="New Password"
                  value={localSecurityData.newPassword}
                  onChange={(e) => handleSecurityInputChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password should be at least 6 characters long
                </p>
              </div>
              <div>
                <input
                  ref={confirmPasswordRef}
                  type="password"
                  placeholder="Confirm New Password"
                  value={localSecurityData.confirmPassword}
                  onChange={(e) => handleSecurityInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={handleLocalPasswordChange}
                disabled={localLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {localLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <User size={20} />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                  activeTab === 'security' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                <Shield size={20} />
                Security
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 ${
                    activeTab === 'admin' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                  }`}
                >
                  <AlertCircle size={20} />
                  Admin
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'profile' && renderProfileSettings()}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'admin' && <AdminSection />}
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      <ProfilePictureModal 
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        onUpload={handleProfilePictureUpload}
      />
    </div>
  );
};

export default SettingsPage;