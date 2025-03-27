export const validateName = (name: string) => {
    if (!/^[a-zA-Z\s]*$/.test(name)) {
        return "Name should not contain special characters or numbers";
    }

    return "";
};

export const validateEmail = (email: string) => {
    if (!/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(email)) {
        return "Email is not valid";
    }

    return "";
};

export const validatePassword = (password: string) => {
    if (password.length < 6) {
        return "Password should be at least 6 characters";
    }

    return "";
};

export const validatePhone = (phone: string) => {
    if (phone == "") {
        return "";
    }

    if (!/^\d+$/.test(phone)) {
        return "Phone should only contain numbers";
    }

    return "";
};
