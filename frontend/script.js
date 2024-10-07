// script.js

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('image-preview');
const searchBtn = document.getElementById('search-btn');
const results = document.getElementById('results');

let uploadedImageFile = null; // Store the uploaded image file

// Handle file drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active'); // Add visual feedback when dragging over
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active'); // Remove feedback when leaving
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active'); // Remove feedback when file is dropped
    const files = e.dataTransfer.files;
    if (files.length) {
        handleFiles(files);
    }
});

// Handle file input (click to upload)
dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    if (files.length) {
        handleFiles(files);
    }
});

// Function to handle file and display preview
function handleFiles(files) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.innerHTML = '';
            preview.appendChild(img);
            preview.style.display = 'block'; // Display the image preview
            dropZone.querySelector('p').style.display = 'none'; // Hide the default text
            searchBtn.disabled = false; // Enable search button after image is uploaded
        };
        uploadedImageFile = file; // Store the uploaded image file for later use
        reader.readAsDataURL(file);
    } else {
        alert('Please drop a valid image file.');
    }
}

// Fetch images from the local API endpoint
searchBtn.addEventListener('click', () => {
    const apiUrl = 'http://localhost:5000/api/search'; // Your local API endpoint

    // Check if an image file has been uploaded before proceeding
    if (!uploadedImageFile) {
        alert('Please upload an image file before searching.');
        return; // Exit if no file is uploaded
    }

    // Create a FileReader to convert the image to Base64
    const reader = new FileReader();
    
    // Read the uploaded image file as Data URL (Base64)
    reader.readAsDataURL(uploadedImageFile); // Convert to Base64

    reader.onloadend = () => {
        const base64Image = reader.result.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''); // This contains the Base64 encoded image
        // Send the POST request to the API with Base64 encoded image
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ image: base64Image }) 
        })
        .then(response => response.json()) 
        .then(data => {
            results.innerHTML = ''; 
            const imagePaths = data.image_paths; 

            if (Array.isArray(imagePaths)) {
                imagePaths.forEach(path => {
                    const img = document.createElement('img');
                    img.src = path; 
                    img.alt = 'Result Image'; 
                    results.appendChild(img);
                });
            } else {
                alert('Unexpected response format. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while fetching results. Please try again.');
        });
    };
});

// Handle the drop event in the drop zone
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active'); // Remove feedback when file is dropped
    const imageSrc = e.dataTransfer.getData('text/plain'); // Get the image source
    if (imageSrc) {
        // Create a new image file object
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'dropped-image.png', { type: blob.type });
                handleFiles([file]); // Call handleFiles with the new file
            })
            .catch(err => alert('Failed to load image. Please try again.'));
    }
});