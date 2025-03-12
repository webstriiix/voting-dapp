import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Votingdapp } from '../target/types/votingdapp'

describe('votingdapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Votingdapp as Program<Votingdapp>

  const votingdappKeypair = Keypair.generate()

  it('Initialize Poll', async () => {
      await program.methods.initializePoll(
        new anchor.BN(1),
        "What is your favorite ayam bakar?",
        new anchor.BN(0),
        new anchor.BN(1841535436),
      ).rpc();

      const [pollAddress] = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
        program.programId,
      )

      const poll = await program.account.poll.fetch(pollAddress)
      console.log(poll)

      expect(poll.pollId.toNumber()).toEqual(1)
      expect(poll.description).toEqual("What is your favorite ayam bakar?")
      expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })

  it('Initialize Candidate', async () => {
    await program.methods.initializeCandidate(
        "Anis",
        new anchor.BN(1),
    ).rpc();
    
    await program.methods.initializeCandidate(
        "Ahok",
        new anchor.BN(1),
    ).rpc();

    // setup test for anis candidate
    const [anisAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Anis")],
      program.programId
    )
    const anisCandidate = await program.account.candidate.fetch(anisAddress)
    console.log(anisCandidate)
    expect(anisCandidate.candidateVotes.toNumber()).toEqual(0)

     // setup test for ahok candidate
    const [ahokAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Ahok")],
      program.programId
    )
    const ahokCandidate = await program.account.candidate.fetch(ahokAddress)
    console.log(ahokCandidate)
    expect(anisCandidate.candidateVotes.toNumber()).toEqual(0)

  })

  it('vote', async () => {
    await program.methods
    .vote(
        "Anis",
        new anchor.BN(1))
    .rpc()
    

    // setup test for anis candidate
    const [anisAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Anis")],
      program.programId
    )
    const anisCandidate = await program.account.candidate.fetch(anisAddress)
    console.log(anisCandidate)
    let n = 0;
    for (let i = 0 ; i < anisCandidate.candidateVotes.toNumber(); i++) { 
      n += 1
      
    }
    expect(anisCandidate.candidateVotes.toNumber()).toEqual(n)
  })

})
