export const mapDay = (day: string) => {
    switch (day) {
        case "Monday":
            return "mon";
        case "Tuesday":
            return "tue";
        case "Wednesday":
            return "wed";
        case "Thursday":
            return "thu";
        case "Friday":
            return "fri";
        case "Saturday":
            return "sat";
        case "Sunday":
            return "sun";
        default:
            return "mon";
    }
};

export const mapNumberToDay = (day: number) => {
    switch (day) {
        case 1:
            return "mon";
        case 2:
            return "tue";
        case 3:
            return "wed";
        case 4:
            return "thu";
        case 5:
            return "fri";
        case 6:
            return "sat";
        case 0:
            return "sun";
        default:
            return "mon";
    }
};
