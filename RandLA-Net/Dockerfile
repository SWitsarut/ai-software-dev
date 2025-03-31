FROM ubuntu:latest

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Update and install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    libsm6 \
    libxext6 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Miniconda
RUN mkdir -p ~/miniconda3 \
    && wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh \
    && bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3 \
    && rm ~/miniconda3/miniconda.sh

# Set path to conda
ENV PATH="/root/miniconda3/bin:${PATH}"

# Initialize conda for shell execution
RUN conda init bash

# Create and set up the conda environment
SHELL ["/bin/bash", "-c"]
RUN conda create -n randlanet python=3.6 -y \
    && source ~/miniconda3/etc/profile.d/conda.sh \
    && conda activate randlanet

# Copy requirements and install dependencies
COPY ./requirements.txt .
RUN source ~/miniconda3/etc/profile.d/conda.sh \
    && conda activate randlanet \
    && pip install -r requirements.txt

# Default command
# CMD ["python","./server.py"]
ENTRYPOINT ["/bin/bash", "-c", "source ~/miniconda3/etc/profile.d/conda.sh && conda activate randlanet && python ./server.py"]

# CMD ["/bin/bash"]