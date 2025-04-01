
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


export function cal_init_price(selected_labels: number[]): number {
    let totalPrice = 0;
    for (const index of selected_labels) {
        totalPrice += classPricing[index];
    }

    return totalPrice
}