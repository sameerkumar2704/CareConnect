import {
    faUserMd,
    faHeartbeat,
    faBrain,
    faBone,
    faStethoscope,
    faUserDoctor,
    faLungsVirus,
    faUserNurse,
    faHeart,
} from "@fortawesome/free-solid-svg-icons";

// This utility maps specialty names to their corresponding FontAwesome icons
export const getSpecialtyIcon = (specialtyName: string) => {
    const name = specialtyName.toLowerCase();

    if (
        name.includes("general medicine") ||
        name.includes("general practitioner")
    ) {
        return faUserMd;
    }

    if (name.includes("family medicine") || name.includes("family practice")) {
        return faUserDoctor;
    }

    if (name.includes("internal medicine")) {
        return faStethoscope;
    }

    if (name.includes("general surgery")) {
        return faHeart;
    }

    if (
        name.includes("cardio") ||
        name.includes("heart") ||
        name.includes("cardiac")
    ) {
        return faHeartbeat;
    }

    if (name.includes("neuro") || name.includes("brain")) {
        return faBrain;
    }

    if (name.includes("ortho") || name.includes("bone")) {
        return faBone;
    }

    if (
        name.includes("pulmonary") ||
        name.includes("lung") ||
        name.includes("respiratory")
    ) {
        return faLungsVirus;
    }

    if (
        name.includes("plastic") ||
        name.includes("reconstructive") ||
        name.includes("cosmetic")
    ) {
        return faUserNurse;
    }

    // Default icon if no match is found
    return faUserMd;
};

// You may need to fix the faScalpel import if it's not available in your FontAwesome library
// FontAwesome doesn't have a scalpel icon by default, you might need to replace it with another medical icon
// like faNotesMedical or faUserMd
