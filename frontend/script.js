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
    const apiUrl = 'http://localhost:5000/upload-image'; // Your local API endpoint

    // Create a FormData object and append the image file
    const formData = new FormData();
    formData.append('image', uploadedImageFile); // 'image' is the key expected by your API

    // Send the POST request to the API
    fetch(apiUrl, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(imagePaths => {
        results.innerHTML = ''; // Clear previous results

        // Check if the response is an array
        if (Array.isArray(imagePaths)) {
            // Loop through and display the images
            imagePaths.forEach(path => {
                const img = document.createElement('img');
                img.src = path; // Use the image path from the API response
                results.appendChild(img);
            });
        } else {
            alert('Unexpected response format. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error fetching images:', error);
        alert('There was an issue fetching the images. Please try again later.');
    });
});
