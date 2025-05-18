// src/utils/redirect.ts
export const getRedirectPath = (
    locationSearch: string,
    fallback: string = "/"
) => {
    const queryParams = new URLSearchParams(locationSearch);
    const redirect = queryParams.get("redirect");
    return redirect || fallback;
};
