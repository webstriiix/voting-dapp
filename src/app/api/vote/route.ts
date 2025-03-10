import { Votingdapp } from "@/../anchor/target/types/votingdapp";
import { BN, Program } from "@coral-xyz/anchor";
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

const IDL = require('@/../anchor/target/idl/votingdapp.json')

export const OPTIONS = GET

export async function GET(request: Request) {
    const actionMetadata: ActionGetResponse = { 
        icon: "https://avatars.githubusercontent.com/u/81008793?v=4",
        title: "Vote for your favorite candidate politics!",
        description: "Vote between Anis and Ahok for next Indonesia Presiden 2029!",
        label: "Vote",
        links: {
            actions: [
                {
                    label: "Vote for Anis",
                    href: "/api/vote?candidate=Anis",
                    type: "transaction"
                },
                {
                    label: "Vote for Ahok",
                    href: "/api/vote?candidate=Ahok",
                    type: "transaction"
                }
            ]
        }
    }
    return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
    const url = new URL(request.url);
    const candidate = url.searchParams.get("candidate")

    if (candidate != "Ahok" && candidate != "Anis") {
        return new Response("Invalid candidate", { status: 404, headers: ACTIONS_CORS_HEADERS })
    }

    const connection = new Connection("http://127.0.0.1:8899", "confirmed")
    const program: Program<Votingdapp> = new Program(IDL, { connection })

    const body: ActionPostRequest = await request.json();
    let voter;

    try {
        voter = new PublicKey(body.account)
    } catch (error) {
        return new Response("Invalide Account", { status: 404, headers: ACTIONS_CORS_HEADERS })
    }

    const instruction = program.methods
        .vote(candidate, new BN(1))
        .accounts({
            signer: voter
        })
        .instruction()
    
    const blockhash = await connection.getLatestBlockhash()

    const transaction = new Transaction({
        feePayer: voter,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
    })
        .add(await instruction)
    
    const response = await createPostResponse({
        fields: {
            transaction: transaction,
            type: "transaction"
        }
    })

    return Response.json(response, {headers: ACTIONS_CORS_HEADERS})
}
