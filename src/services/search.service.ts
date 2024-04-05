import * as searchRepo from "@src/repos/search.repo";

export async function searchByName(name: string) {
    const result = await searchRepo.getPersonsByName(name);
    return result;
}
