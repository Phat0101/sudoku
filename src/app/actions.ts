'use server'

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import sharp from 'sharp';

const sudokuSchema = z.object({
  grid: z.array(
    z.array(z.number().min(0).max(9))
  ).length(9).refine(arr => arr.every(row => row.length === 9), {
    message: "Each row must contain exactly 9 numbers"
  })
});

async function reduceImageResolution(base64Image: string, scale: number = 1): Promise<string> {
  const buffer = Buffer.from(base64Image.split(",")[1], 'base64');
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image metadata');
  }

  const resizedBuffer = await image
    .resize(Math.round(metadata.width * scale), Math.round(metadata.height * scale))
    .toBuffer();

  return `data:image/${metadata.format};base64,${resizedBuffer.toString('base64')}`;
}

export async function parseImageToSudoku(imageData: string): Promise<number[][]> {
  try {
    // Reduce image resolution before processing
    const reducedImage = imageData; // await reduceImageResolution(imageData, 0.5);

    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: sudokuSchema,
      maxTokens: 512,
      messages: [
        {
          role: 'system',
          content: "You are an expert in image processing and Sudoku puzzles. Please analyze this image and extract the numbers into a 9x9 grid."
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: "Extract the numbers from this image:",
            },
            {
              type: 'image',
              image: reducedImage
            }
          ]
        },
      ],
    });

    return object.grid;
  } catch (error) {
    console.error('Error parsing Sudoku image:', error);
    throw new Error('Failed to process Sudoku image');
  }
}
