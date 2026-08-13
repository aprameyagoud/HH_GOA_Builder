// src/lib/titleGenerator.js

export function generateBuilderTitle(roleOrStack) {
  if (!roleOrStack) return 'THE BUILDER';
  const text = roleOrStack.toLowerCase();

  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('figma') || text.includes('visual')) {
    return 'THE VISUAL BUILDER';
  }
  if (text.includes('front') || text.includes('react') || text.includes('vue') || text.includes('css') || text.includes('interface') || text.includes('next')) {
    return 'THE INTERFACE BUILDER';
  }
  if (text.includes('ai') || text.includes('ml') || text.includes('model') || text.includes('python') || text.includes('pytorch') || text.includes('llm') || text.includes('agent')) {
    return 'THE MODEL BUILDER';
  }
  if (text.includes('hardware') || text.includes('iot') || text.includes('arduino') || text.includes('robot') || text.includes('embedded') || text.includes('chip')) {
    return 'THE HARDWARE BUILDER';
  }
  if (text.includes('full') || text.includes('ship') || text.includes('back') || text.includes('node') || text.includes('solana') || text.includes('rust') || text.includes('go')) {
    return 'THE SHIPPER';
  }

  return 'THE SHIPPER';
}
