export enum SignInMode {
    REDIRECT = "redirect",
    POPUP = "popup",
    SILENT = "silent",
}

interface GetExtraQueryParametersProps {
    mode: SignInMode;
    params?: Record<string, string | number | boolean>;
}

export const getExtraQueryParameters = (
    mode: GetExtraQueryParametersProps["mode"],
    params: GetExtraQueryParametersProps["params"],
) => ({
    ...(params ?? {}),
    "trinsic:mode": mode,
});
