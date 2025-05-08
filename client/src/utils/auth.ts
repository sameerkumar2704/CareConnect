import { API_URL } from "./contants";

interface SignUpDetails {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export const createUser = async (details: SignUpDetails) => {
    if (
        !details.name ||
        !details.email ||
        !details.password ||
        !details.confirmPassword
    ) {
        throw Error("Please fill in all fields");
    }

    if (details.password !== details.confirmPassword) {
        throw Error("Passwords do not match");
    }

    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
    });

    const data = await response.json();

    if (data.error) {
        throw Error(data.error);
    }

    localStorage.setItem("eWauthToken", data.data.token);

    return { message: "User Created Successfully", user: data.data.user };
};

interface User {
    email: string;
    password: string;
}

export const signUser = async (details: User) => {
    if (!details.email || !details.password) {
        throw Error("Please fill in all fields");
    }

    const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(details),
    });

    const data = await response.json();

    if (data.error) {
        throw Error(data.error);
    }

    localStorage.setItem("eWauthToken", data.data.token);

    return { message: "User Login Successfull", user: data.data.user };
};

export const verifyToken = async (token: string) => {
    const response = await fetch(`${API_URL}/users/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("eWauthToken")}`,
        },
        body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (data.error) {
        throw Error(data.error);
    }

    console.log("Date at Verify", data);

    if (data.user)
        return {
            ok: "Valid Token",
            role: data.role,
            _id: data.user.id,
        };
    else if (data.hospital) {
        return {
            ok: "Valid Token",
            role: data.role,
            _id: data.hospital.id,
        };
    } else {
        return {
            ok: "Invalid Token",
            role: null,
            _id: null,
        };
    }
};
