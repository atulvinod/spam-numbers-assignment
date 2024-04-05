import * as searchRepo from "@src/repos/search.repo";

export async function searchByName(name: string, currentUserId: number) {
    const result = await searchRepo.getPersonsByName(name, currentUserId);
    return result;
}
