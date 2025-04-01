// const classPricing = {
//     // Basic/common objects - lower price
//     0: 0,     // Unlabeled - free

//     12: 10,   // Road
//     13: 40,   // Parking
//     14: 40,   // Sidewalk
//     15: 30,   // Other ground
//     16: 60,   // Building
//     17: 50,   // Fence
//     23: 45,   // Pole
//     24: 45,   // Traffic sign

//     // Vegetation/terrain
//     20: 35,   // Vegetation
//     21: 35,   // Trunk
//     22: 30,   // Terrain

//     // Vehicles and people - higher price (more complex to detect accurately)
//     2: 80,    // Car
//     3: 70,    // Bicycle
//     5: 75,    // Motorcycle
//     7: 85,    // Truck
//     8: 75,    // Other vehicle
//     9: 90,    // Person
//     10: 80,   // Bicyclist
//     11: 85,   // Motorcyclist
// };

const classPricing: { [key: number]: number } = {
    0: 0,
    12: 10,
    13: 40,
    14: 40,
    15: 30,
    16: 60,
    17: 50,
    23: 45,
    24: 45,

    20: 35,
    21: 35,
    22: 30,
    2: 80,
    3: 70,
    5: 75,
    7: 85,
    8: 75,
    9: 90,
    10: 80,
    11: 85,

};


export function cal_init_price(selected_labels: number[]):number {
    let totalPrice = 0;
    for (const index of selected_labels) {
        totalPrice += classPricing[index];
    }
    return totalPrice
}
