import * as searchRepo from "@src/repos/search.repo";

export async function searchByName(name: string, currentUserId: number) {
    const result = await searchRepo.searchPersonsByName(name, currentUserId);
    return result;
}

export async function searchByPhone(
    phoneNumber: string,
    countryCode: string,
    currentUserId: number,
) {
    const result = await searchRepo.searchPersonsByPhone(
        phoneNumber,
        countryCode,
        currentUserId,
    );
    return result;
}