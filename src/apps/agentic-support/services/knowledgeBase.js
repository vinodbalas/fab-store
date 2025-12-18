// Knowledge Base Service
// Structured for real ML integration, currently uses localStorage

const STORAGE_KEY = "agenticSupport.knowledgeBase";

export function loadKnowledgeBase() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { categories: [] };
  } catch {
    return { categories: [] };
  }
}

// Search knowledge base for relevant chunks (mock semantic search for now)
// TODO: Replace with real vector similarity search (e.g., using OpenAI embeddings + cosine similarity)
export function searchKnowledgeBase(query, categoryId = null) {
  const kb = loadKnowledgeBase();
  const queryLower = query.toLowerCase();

  // Find relevant vectors/chunks
  const results = [];
  
  kb.categories.forEach((category) => {
    if (categoryId && category.id !== categoryId) return;
    
    (category.vectors || []).forEach((vector) => {
      const textLower = vector.text.toLowerCase();
      // Simple keyword matching (replace with vector similarity in production)
      const keywords = queryLower.split(/\s+/);
      const matches = keywords.filter((kw) => textLower.includes(kw)).length;
      
      if (matches > 0) {
        results.push({
          ...vector,
          categoryId: category.id,
          categoryTitle: category.title,
          relevanceScore: matches / keywords.length, // Mock score
        });
      }
    });
  });

  // Sort by relevance and return top matches
  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5); // Top 5 most relevant chunks
}

// Get category by intent/workflow
export function getCategoryForWorkflow(workflowType) {
  const kb = loadKnowledgeBase();
  
  // Simple mapping (in production, use ML to match workflow to category)
  const workflowToCategory = {
    printer_offline: "Printer Troubleshooting",
    ink_error: "Printer Troubleshooting",
  };

  const categoryTitle = workflowToCategory[workflowType];
  if (!categoryTitle) return null;

  return kb.categories.find((cat) => cat.title === categoryTitle);
}

