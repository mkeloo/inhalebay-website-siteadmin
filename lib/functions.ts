// functions.ts
export function generateRandomGradient(): string {
    const colors = [
        "red",
        "orange",
        "amber",
        "yellow",
        "lime",
        "green",
        "emerald",
        "teal",
        "cyan",
        "sky",
        "blue",
        "indigo",
        "violet",
        "purple",
        "fuchsia",
        "pink",
        "rose"
    ];

    const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
    const gradientTypes = ["from-to", "from-via-to"];

    const type = gradientTypes[Math.floor(Math.random() * gradientTypes.length)];

    if (type === "from-to") {
        const fromColor = getRandomColor();
        let toColor = getRandomColor();
        while (toColor === fromColor) {
            toColor = getRandomColor();
        }
        return `from-${fromColor}-500 to-${toColor}-500`;
    }

    // type === "from-via-to"
    const fromColor = getRandomColor();
    let viaColor = getRandomColor();
    let toColor = getRandomColor();

    // Ensure uniqueness
    while (viaColor === fromColor) {
        viaColor = getRandomColor();
    }

    while (toColor === viaColor || toColor === fromColor) {
        toColor = getRandomColor();
    }

    return `from-${fromColor}-500 via-${viaColor}-500 to-${toColor}-500`;
}