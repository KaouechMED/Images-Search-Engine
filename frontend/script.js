// script.js

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('image-preview');
const searchBtn = document.getElementById('search-btn');
const results = document.getElementById('results');

let uploadedImageFile = null; 

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('active'); 
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active'); 
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active'); 
    const files = e.dataTransfer.files;
    if (files.length) {
        handleFiles(files);
    }
});

dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    if (files.length) {
        handleFiles(files);
    }
});

function handleFiles(files) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.innerHTML = '';
            preview.appendChild(img);
            preview.style.display = 'block'; 
            dropZone.querySelector('p').style.display = 'none'; 
            searchBtn.disabled = false; 
        };
        uploadedImageFile = file; 
        reader.readAsDataURL(file);
    } else {
        alert('Please drop a valid image file.');
    }
}

searchBtn.addEventListener('click', () => {
    const apiUrl = 'http://localhost:5000/api/search';

    if (!uploadedImageFile) {
        alert('Please upload an image file before searching.');
        return; 
    }

    const reader = new FileReader();
    
    reader.readAsDataURL(uploadedImageFile); // Convert to Base64

    reader.onloadend = () => {
        const base64Image = reader.result.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''); 
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

            if (data.message) {
                const message = document.createElement('p');
                message.textContent = data.message; 
                results.appendChild(message);
                return; 
            }

            const base64Images = data.images_data; 

            if (Array.isArray(base64Images)) {
                base64Images.forEach(base64Image => {
                    const img = document.createElement('img');
                    img.src = `data:image/png;base64,${base64Image}`; 
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

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    const imageSrc = e.dataTransfer.getData('text/plain'); 
    if (imageSrc) {
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'dropped-image.png', { type: blob.type });
                handleFiles([file]); 
            })
            .catch(err => alert('Failed to load image. Please try again.'));
    }
});