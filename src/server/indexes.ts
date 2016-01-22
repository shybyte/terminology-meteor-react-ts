try {
  Entities._dropIndex('fullText');
} catch (error) {

}

Entities._ensureIndex({
    name: 'text',
    description: 'text',
    notes: 'text',
  },
  {
    name: 'fullText',
    weights: {
      name: 3,
      description: 1,
      notes: 1
    }
  }
);