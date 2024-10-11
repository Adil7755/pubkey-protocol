import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'
import { getPubKeyProfilePda, pubKeyIdentityProvider } from '../src'
import { PubkeyProtocol } from '../target/types/pubkey_protocol'
import { unique } from './utils/unique'
import { getProfileAvatarUrl } from './utils/get-avatar-url'
import { airdropAccounts } from './utils/airdropper'
import { createTestProfile } from './utils'

describe('pubkey-protocol-profile', () => {
  const username = unique('alice')
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const feePayer = provider.wallet as anchor.Wallet
  const program = anchor.workspace.PubkeyProtocol as Program<PubkeyProtocol>

  const communityMember1 = Keypair.generate()
  const communityMember2 = Keypair.generate()

  beforeAll(async () => {
    await airdropAccounts(provider, [
      { label: 'communityMember1', publicKey: communityMember1.publicKey },
      { label: 'communityMember2', publicKey: communityMember2.publicKey },
    ])
    await createTestProfile(username, program, communityMember1, feePayer.publicKey).catch((err) => console.error(err))
  })

  describe('Profile', () => {
    it('Create PubkeyProfile', async () => {
      const [profile, bump] = getPubKeyProfilePda({ username, programId: program.programId })

      const {
        authorities,
        identities,
        avatarUrl,
        bump: receivedBump,
        feePayer: receivedFeePayer,
        username: receivedUsername,
      } = await program.account.profile.fetch(profile)

      const postBalance = await provider.connection.getBalance(communityMember1.publicKey)

      expect(postBalance).toStrictEqual(LAMPORTS_PER_SOL)
      expect(receivedBump).toStrictEqual(bump)
      expect(receivedUsername).toStrictEqual(username)
      expect(avatarUrl).toStrictEqual(getProfileAvatarUrl(username))
      expect(authorities).toEqual([communityMember1.publicKey])
      expect(receivedFeePayer).toStrictEqual(feePayer.publicKey)

      expect(identities).toEqual([
        {
          provider: pubKeyIdentityProvider.Solana,
          providerId: communityMember1.publicKey.toString(),
          name: 'Primary Wallet',
          communities: [],
        },
      ])
    })

    it('Update profile details', async () => {
      const [profile] = getPubKeyProfilePda({ username, programId: program.programId })
      const input = {
        authority: communityMember1.publicKey,
        newName: 'Test Profile',
        newAvatarUrl: getProfileAvatarUrl(`${username}_new`),
      }
      await program.methods
        .updateProfileDetails(input)
        .accounts({
          profile,
          feePayer: feePayer.publicKey,
        })
        .rpc()

      const { avatarUrl: newAvatarUrl, name: newName } = await program.account.profile.fetch(profile)
      expect(newAvatarUrl).toStrictEqual(input.newAvatarUrl)
      expect(newName).toStrictEqual(input.newName)
    })

    it('Add Authority', async () => {
      const [profile] = getPubKeyProfilePda({ username, programId: program.programId })

      await program.methods
        .addProfileAuthority({ newAuthority: communityMember2.publicKey })
        .accountsStrict({
          profile,
          authority: communityMember1.publicKey,
          feePayer: feePayer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([communityMember1])
        .rpc()

      const { authorities } = await program.account.profile.fetch(profile)

      const postBalance = await provider.connection.getBalance(communityMember1.publicKey)

      expect(postBalance).toStrictEqual(LAMPORTS_PER_SOL)
      expect(authorities.length).toStrictEqual(2)
    })

    it('Remove Authority', async () => {
      const [profile] = getPubKeyProfilePda({ username, programId: program.programId })

      await program.methods
        .removeAuthority({ authorityToRemove: communityMember2.publicKey })
        .accountsStrict({ profile, authority: communityMember1.publicKey, feePayer: feePayer.publicKey })
        .signers([communityMember1])
        .rpc()

      const { authorities } = await program.account.profile.fetch(profile)

      expect(authorities).toEqual([communityMember1.publicKey])
    })
  })
})
