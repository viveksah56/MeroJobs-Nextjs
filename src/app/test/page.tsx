"use client";

import { useEffect } from "react";
import {
    decodeJwt,
    getAuthUser,
    isTokenExpired,
    hasRole,
    hasAuthority,
} from "@/utils/jwt";

export default function TestPage() {
    const token =
        "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzdW1hbjEyLmthcmtpQGdtYWlsLmNvbSIsImp0aSI6ImUzZDJjNGY2LWM5ZjktNDAyMi05NDgzLTZmMTE1MTU3ZjlmZSIsImlhdCI6MTc3NzkxMzQ2MiwiZXhwIjoxNzc3OTE3MDYyLCJhdXRob3JpdGllcyI6WyJST0xFX0pPQlNFRUtFUiIsIkZBQ1RPUl9QQVNTV09SRCJdLCJ0eXBlIjoiQUNDRVNTIiwicm9sZXMiOlsiSk9CU0VFS0VSIl0sInVzZXJJZCI6Ijk0YWNhYjQ1LWY1MDktNGExNy1iNGZhLTdkOWRkNmRmMDcyOSJ9.7-8nOYr0WjHLGip4qEkd8AGTmxFLUdvysTRvaNmHRAgsExVnZNJ-Y-lljUuBhHfBPjk_ju9Y2qb2Wla5246Fcw";

    useEffect(() => {
        const decoded = decodeJwt(token);
        const user = getAuthUser(token);
        const expired = isTokenExpired(token);
        const tokenType = decoded?.type;

        console.log("Decoded:", decoded);
        console.log("User:", user);
        console.log("Expired:", expired);
        console.log("Token Type:", tokenType);


        // Extra checks
        console.log("Has role JOBSEEKER:", hasRole(token, "JOBSEEKER"));
        console.log(
            "Has authority ROLE_JOBSEEKER:",
            hasAuthority(token, "ROLE_JOBSEEKER")
        );
    }, []);

    return <div>Check console for JWT test</div>;
}