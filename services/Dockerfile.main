FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
COPY vgg16_encoder.py .
COPY main.py .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt
# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["python", "main.py"]
