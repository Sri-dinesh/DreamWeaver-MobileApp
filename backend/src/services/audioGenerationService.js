const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

// Audio generation using Web Audio API simulation with raw PCM
class AudioGenerationService {
  constructor() {
    this.sampleRate = 16000; // Reduced from 44100 for smaller file sizes (~64% reduction)
  }

  // Generate sine wave at specified frequency
  generateSineWave(frequency, durationSeconds, sampleRate = this.sampleRate) {
    const samples = Math.floor(durationSeconds * sampleRate);
    const buffer = Buffer.alloc(samples * 2); // 16-bit audio
    
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
      const value = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
      buffer.writeInt16LE(value, i * 2);
    }
    
    return buffer;
  }

  // Generate white noise
  generateWhiteNoise(durationSeconds, sampleRate = this.sampleRate) {
    const samples = Math.floor(durationSeconds * sampleRate);
    const buffer = Buffer.alloc(samples * 2);
    
    for (let i = 0; i < samples; i++) {
      const sample = Math.random() * 2 - 1;
      const value = sample * 0x7FFF;
      buffer.writeInt16LE(value, i * 2);
    }
    
    return buffer;
  }

  // Apply volume adjustment (dBFS to linear)
  dbfsToLinear(dbfs) {
    return Math.pow(10, dbfs / 20);
  }

  // Mix two audio buffers
  mixAudio(buffer1, buffer2, volume1 = -6, volume2 = -6) {
    const maxLength = Math.max(buffer1.length, buffer2.length);
    const mixed = Buffer.alloc(maxLength);
    
    const vol1 = this.dbfsToLinear(volume1);
    const vol2 = this.dbfsToLinear(volume2);
    
    for (let i = 0; i < maxLength; i += 2) {
      let sample = 0;
      
      if (i < buffer1.length) {
        sample += buffer1.readInt16LE(i) * vol1;
      }
      if (i < buffer2.length) {
        sample += buffer2.readInt16LE(i) * vol2;
      }
      
      // Clamp to prevent clipping
      sample = Math.max(-32768, Math.min(32767, sample));
      mixed.writeInt16LE(sample, i);
    }
    
    return mixed;
  }

  // Create WAV file from PCM buffer
  createWavFile(pcmBuffer, sampleRate = this.sampleRate, channels = 1) {
    const bitsPerSample = 16;
    const byteRate = sampleRate * channels * (bitsPerSample / 8);
    const blockAlign = channels * (bitsPerSample / 8);
    
    const wavHeader = Buffer.alloc(44);
    
    // RIFF header
    wavHeader.write('RIFF', 0);
    wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
    wavHeader.write('WAVE', 8);
    
    // fmt sub-chunk
    wavHeader.write('fmt ', 12);
    wavHeader.writeUInt32LE(16, 16); // Subchunk1Size
    wavHeader.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    wavHeader.writeUInt16LE(channels, 22); // Number of channels
    wavHeader.writeUInt32LE(sampleRate, 24);
    wavHeader.writeUInt32LE(byteRate, 28);
    wavHeader.writeUInt16LE(blockAlign, 32);
    wavHeader.writeUInt16LE(bitsPerSample, 34);
    
    // data sub-chunk
    wavHeader.write('data', 36);
    wavHeader.writeUInt32LE(pcmBuffer.length, 40);
    
    return Buffer.concat([wavHeader, pcmBuffer]);
  }

  // Generate Binaural Beat
  generateBinauralBeat(carrierFreq, beatFreq, durationMinutes, volumeDbfs = -6) {
    const durationSeconds = durationMinutes * 60;
    
    // Generate left channel (carrier frequency)
    const leftChannel = this.generateSineWave(carrierFreq, durationSeconds);
    
    // Generate right channel (carrier frequency + beat frequency)
    const rightChannel = this.generateSineWave(carrierFreq + beatFreq, durationSeconds);
    
    // Apply volume to both channels
    const volume = this.dbfsToLinear(volumeDbfs);
    
    // Create stereo buffer (interleaved: L, R, L, R, ...)
    const stereoBuffer = Buffer.alloc(leftChannel.length * 2);
    
    // Interleave left and right channels
    for (let i = 0; i < leftChannel.length; i += 2) {
      const leftSample = Math.floor(leftChannel.readInt16LE(i) * volume);
      const rightSample = Math.floor(rightChannel.readInt16LE(i) * volume);
      
      // Write left sample at position i
      stereoBuffer.writeInt16LE(leftSample, i);
      // Write right sample at position i+2
      stereoBuffer.writeInt16LE(rightSample, i + 2);
    }
    
    return this.createWavFile(stereoBuffer, this.sampleRate, 2);
  }

  // Generate Subliminal Audio
  generateSubliminalAudio(affirmationText, maskingType, durationMinutes, subliminalVolumeDbfs = -30, maskingVolumeDbfs = -10) {
    const durationSeconds = durationMinutes * 60;
    
    // Generate masking sound
    let maskingBuffer;
    if (maskingType === 'white-noise') {
      maskingBuffer = this.generateWhiteNoise(durationSeconds);
    } else if (maskingType === 'ambient-tone') {
      // Low frequency ambient tone (40 Hz)
      maskingBuffer = this.generateSineWave(40, durationSeconds);
    } else {
      maskingBuffer = this.generateWhiteNoise(durationSeconds);
    }
    
    // Generate subliminal layer (high frequency carrier)
    // Using 8000 Hz carrier frequency for subliminal layer
    const subliminalBuffer = this.generateSineWave(8000, durationSeconds);
    
    // Ensure both buffers are same length
    const maxLength = Math.max(subliminalBuffer.length, maskingBuffer.length);
    const subliminalPadded = Buffer.alloc(maxLength);
    const maskingPadded = Buffer.alloc(maxLength);
    
    subliminalBuffer.copy(subliminalPadded);
    maskingBuffer.copy(maskingPadded);
    
    // Mix subliminal and masking sounds
    const mixedBuffer = this.mixAudio(subliminalPadded, maskingPadded, subliminalVolumeDbfs, maskingVolumeDbfs);
    
    return this.createWavFile(mixedBuffer, this.sampleRate, 1);
  }

  // Save buffer to file
  saveToFile(buffer, filePath) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, buffer, (err) => {
        if (err) reject(err);
        else resolve(filePath);
      });
    });
  }

  // Convert buffer to base64 for transmission
  bufferToBase64(buffer) {
    return buffer.toString('base64');
  }
}

module.exports = new AudioGenerationService();
