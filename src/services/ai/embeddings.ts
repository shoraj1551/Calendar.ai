export const EmbeddingService = {
    // Generate Embedding (Mock - in real app call OpenAI text-embedding-3-small)
    async generateEmbedding(text: string): Promise<number[]> {
        // Return random vector of 1536 dims (same as OpenAI)
        return Array.from({ length: 1536 }, () => Math.random());
    },

    // Calculate Cosine Similarity
    cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        return dotProduct / (magA * magB);
    }
};
