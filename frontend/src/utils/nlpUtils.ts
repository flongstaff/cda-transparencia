/**
 * NLP Utilities for Carmen de Areco Transparency Portal
 * Provides natural language processing functions for search and analysis
 * Follows AAIP guidelines for transparency and privacy preservation
 */

/**
 * Preprocess text for Spanish language processing
 * - Normalizes text
 * - Removes extra whitespace
 * - Converts to lowercase
 */
export function preprocessSpanishText(text: string): string {
  if (!text) return '';
  
  return text
    // Normalize text (remove accents temporarily for comparison)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Convert to lowercase
    .toLowerCase()
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim();
}

/**
 * Extract keywords from Spanish text
 * Uses a basic approach; in production, would use proper NLP
 */
export function extractSpanishKeywords(text: string, options: { 
  limit?: number; 
  excludeCommon?: boolean; 
} = {}): string[] {
  const { limit = 10, excludeCommon = true } = options;
  
  if (!text) return [];
  
  // Common Spanish words to potentially exclude
  const commonWords = excludeCommon ? [
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se',
    'las', 'por', 'un', 'para', 'con', 'no', 'una', 'su', 'al',
    'es', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o',
    'fue', 'este', 'ha', 'sí', 'porque', 'esta', 'entre', 'cuando',
    'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde',
    'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les',
    'ni', 'contra', 'otros', 'ese', 'e', 'cada', 'debe', 'parte', 'lugar',
    'otra', 'si', 'tiene', 'años', 'ante', 'cómo', 'cuyo', 'ese', 'todo',
    'otro', 'año', 'municipio', 'gobierno', 'presupuesto', 'transparencia'
  ] : [];
  
  // Preprocess text
  const processedText = preprocessSpanishText(text);
  
  // Split into words and remove common words
  const words = processedText
    .split(/\s+/)
    .filter(word => word.length > 2) // Only words longer than 2 characters
    .filter(word => !commonWords.includes(word))
    .filter(word => /^[a-záéíóúñü]+$/i.test(word)); // Only alphabetic characters (Spanish)
  
  // Count word frequencies
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });
  
  // Sort by frequency and return top words
  const sortedWords = Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  return sortedWords.slice(0, limit);
}

/**
 * Calculate similarity between two Spanish texts
 * Implements a basic cosine similarity algorithm
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  // Preprocess both texts
  const processed1 = preprocessSpanishText(text1);
  const processed2 = preprocessSpanishText(text2);
  
  // Get words from both texts
  const words1 = processed1.split(/\s+/).filter(w => w);
  const words2 = processed2.split(/\s+/).filter(w => w);
  
  // Create word frequency vectors
  const allWords = Array.from(new Set([...words1, ...words2]));
  const vector1 = allWords.map(word => words1.filter(w => w === word).length);
  const vector2 = allWords.map(word => words2.filter(w => w === word).length);
  
  // Calculate cosine similarity
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Generate a simple embedding representation for text
 * This is a placeholder implementation; in production, would use a real embedding model
 */
export async function generateTextEmbedding(text: string): Promise<number[]> {
  // This is a placeholder - in production, this would call a real embedding model
  // or use a locally hosted model for privacy compliance
  
  // For demonstration, we'll create a deterministic "embedding" based on text
  // This is NOT a real embedding and would be replaced with actual model inference
  const embedding: number[] = [];
  const processedText = preprocessSpanishText(text);
  
  // Create a simple hash-based representation (not a real embedding)
  for (let i = 0; i < 384; i++) {
    // Use text content to generate deterministic values
    const charIndex = i % processedText.length;
    const charCode = charIndex < processedText.length ? processedText.charCodeAt(charIndex) : 0;
    
    // Mix in position and character data to create variation
    const value = Math.sin((i * 12.34) + (charCode * 56.78)) * 0.5 + 
                  Math.cos((i * 98.76) - (charCode * 54.32)) * 0.3 +
                  (charCode % 100) * 0.01 - 1.0;
    
    embedding.push(Math.max(-1, Math.min(1, value))); // Clamp to [-1, 1]
  }
  
  return embedding;
}

/**
 * Analyze a document's content for search indexing
 */
export interface DocumentAnalysis {
  keywords: string[];
  entities: string[];
  language: string;
  sentiment?: number; // -1 to 1 scale
  readability?: number; // 0 to 1 scale
}

export function analyzeDocument(text: string, title?: string): DocumentAnalysis {
  const fullText = [title, text].filter(Boolean).join(' ');
  
  return {
    keywords: extractSpanishKeywords(fullText),
    entities: extractEntities(fullText), // Implementation below
    language: 'es', // Assumed Spanish for this portal
    readability: calculateReadability(fullText),
  };
}

/**
 * Extract entities from Spanish text
 * This is a basic implementation; in production, would use proper NER
 */
function extractEntities(text: string): string[] {
  if (!text) return [];
  
  // Basic entity extraction patterns for Spanish documents
  // In production, would use proper NER models
  
  const entities: string[] = [];
  
  // Numbers (could be monetary amounts, years, etc.)
  const numberPattern = /\d{1,3}(?:\.\d{3})*(?:,\d+)?/g;
  const numberMatches = text.match(numberPattern);
  if (numberMatches) {
    entities.push(...numberMatches.slice(0, 5)); // Limit to top 5
  }
  
  // Dates
  const datePattern = /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/g;
  const dateMatches = text.match(datePattern);
  if (dateMatches) {
    entities.push(...dateMatches.slice(0, 3));
  }
  
  // Could extend with: Spanish named entity recognition using spaCy, etc.
  return entities;
}

/**
 * Calculate basic readability score for Spanish text
 */
function calculateReadability(text: string): number {
  if (!text) return 0;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = text.split('').filter(c => /[aeiouáéíóú]/i.test(c)).length;
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  // Very basic calculation (Flesch Reading Ease adapted for Spanish)
  // Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  
  const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  
  // Normalize to 0-1 range (readability scores typically go from 0-100)
  return Math.max(0, Math.min(1, readabilityScore / 100));
}

/**
 * Calculate semantic similarity between two embeddings
 * Uses cosine similarity
 */
export function calculateEmbeddingSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length');
  }
  
  const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
  const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
}