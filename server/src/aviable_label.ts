export const labels: Record<number | string, { visible: boolean; name: string; color: number[] }> = {
  0: { visible: true, name: "Unlabeled", color: [0.65, 0.65, 0.65, 1.0] },
  1: { visible: true, name: "Outlier", color: [0.95, 0.1, 0.1, 1.0] },
  2: { visible: true, name: "Car", color: [0.0, 0.35, 0.85, 1.0] },
  3: { visible: true, name: "Bicycle", color: [0.85, 0.75, 0.1, 1.0] },
  4: { visible: true, name: "Bus", color: [1.0, 0.35, 0.0, 1.0] },
  5: { visible: true, name: "Motorcycle", color: [0.9, 0.1, 0.75, 1.0] },
  6: { visible: true, name: "On-rails", color: [0.1, 0.85, 0.85, 1.0] },
  7: { visible: true, name: "Truck", color: [0.4, 0.25, 0.85, 1.0] },
  8: { visible: true, name: "Other vehicle", color: [0.85, 0.6, 0.25, 1.0] },
  9: { visible: true, name: "Person", color: [1.0, 0.85, 0.1, 1.0] },
  10: { visible: true, name: "Bicyclist", color: [0.1, 0.9, 0.45, 1.0] },
  11: { visible: true, name: "Motorcyclist", color: [0.85, 0.15, 0.45, 1.0] },
  12: { visible: true, name: "Road", color: [0.35, 0.35, 0.35, 1.0] },
  13: { visible: true, name: "Parking", color: [0.5, 0.5, 0.5, 1.0] },
  14: { visible: true, name: "Sidewalk", color: [0.7, 0.7, 0.7, 1.0] },
  15: { visible: true, name: "Other ground", color: [0.65, 0.45, 0.25, 1.0] },
  16: { visible: true, name: "Building", color: [0.45, 0.55, 0.9, 1.0] },
  17: { visible: true, name: "Fence", color: [0.8, 0.6, 0.4, 1.0] },
  18: { visible: true, name: "Other structure", color: [0.9, 0.55, 0.3, 1.0] },
  19: { visible: true, name: "Lane marking", color: [0.95, 0.95, 0.95, 1.0] },
  20: { visible: true, name: "Vegetation", color: [0.2, 0.8, 0.2, 1.0] },
  21: { visible: true, name: "Trunk", color: [0.75, 0.45, 0.1, 1.0] },
  22: { visible: true, name: "Terrain", color: [0.45, 0.75, 0.3, 1.0] },
  23: { visible: true, name: "Pole", color: [0.95, 0.9, 0.2, 1.0] },
  24: { visible: true, name: "Traffic sign", color: [0.95, 0.2, 0.15, 1.0] },
  25: { visible: true, name: "Other object", color: [0.6, 0.2, 0.6, 1.0] },
  26: { visible: true, name: "Moving car", color: [0.15, 0.65, 1.0, 1.0] },
  27: { visible: true, name: "Moving bicyclist", color: [0.4, 0.85, 1.0, 1.0] },
  28: { visible: true, name: "Moving person", color: [1.0, 0.4, 0.75, 1.0] },
  29: { visible: true, name: "Moving motorcyclist", color: [0.7, 0.25, 0.95, 1.0] },
  30: { visible: true, name: "Moving on-rails", color: [0.45, 0.95, 0.4, 1.0] },
  31: { visible: true, name: "Moving bus", color: [1.0, 0.75, 0.3, 1.0] },
  32: { visible: true, name: "Moving truck", color: [0.3, 0.7, 1.0, 1.0] },
  33: { visible: true, name: "Moving other vehicle", color: [0.8, 0.35, 1.0, 1.0] },
  DEFAULT: { visible: true, name: "Unknown", color: [0.6, 0.6, 0.6, 1.0] }
};

export const labelNamesFromIds = (ids: number[]): string[] => {
  return ids.map(id => labels[id]?.name ?? labels["DEFAULT"].name);
};

export const visible_label = (labelsList: number[]) => {
  let result: Record<number | string, { visible: boolean; name: string; color: number[] }> = {};

  labelsList.forEach((label) => {
    if (labels[label]) {
      result[label] = labels[label];
    }
  });

  // Always include DEFAULT
  result["DEFAULT"] = labels["DEFAULT"];

  return result;
};

interface LabelDefinition {
  visible: boolean;
  name: string;
  color: number[];
}

interface ProcessedObject {
  _id: string;
  centroid: {
    x: number;
    y: number;
    z: number;
  };
  objectId: number;
  name: string;
  count: number;
}

interface ProcessedResult {
  objects: ProcessedObject[];
  labelCounts: Record<number, number>;
  labelsSummary: Array<{
    id: number;
    name: string;
    count: number;
    color: number[];
  }>;
}

import mongoose from 'mongoose'

export function processObjectsData(
  objects: mongoose.Document[],
  labels: Record<string | number, LabelDefinition>
): ProcessedResult {
  // Initialize counts object and sequential counter
  const labelCounts: Record<number, number> = {};
  const sequentialCounters: Record<number, number> = {};

  // Process each object and convert Mongoose documents to plain objects
  const processedObjects = objects.map(obj => {
    // Convert Mongoose document to plain object
    const plainObj = obj.toObject ? obj.toObject() : obj;

    // Extract object ID as a string
    const objectId = plainObj.objectId;

    // Get the label name from the labels object or use "Unknown" if not found
    const labelDef = labels[objectId] || labels.DEFAULT;

    // Count this label
    labelCounts[objectId] = (labelCounts[objectId] || 0) + 1;

    // Increment and get sequential counter for this object type
    sequentialCounters[objectId] = (sequentialCounters[objectId] || 0) + 1;
    const sequentialCount = sequentialCounters[objectId];

    // Return a new object with the name, labelName and count added
    return {
      _id: plainObj._id.toString(), // Convert ObjectId to string
      centroid: plainObj.centroid,
      objectId: plainObj.objectId,
      name: labelDef.name,
      labelName: labelDef.name, // Added explicit labelName field
      count: sequentialCount
    };
  });

  // Create summary array with counts
  const labelsSummary = Object.entries(labelCounts).map(([id, count]) => {
    const numId = parseInt(id);
    const labelDef = labels[numId] || labels.DEFAULT;

    return {
      id: numId,
      name: labelDef.name,
      count,
      color: labelDef.color
    };
  }).sort((a, b) => b.count - a.count); // Sort by count in descending order

  return {
    objects: processedObjects,
    labelCounts,
    labelsSummary
  };
}
