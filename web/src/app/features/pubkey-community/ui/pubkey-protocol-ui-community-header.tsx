import { PubKeyCommunity } from '@pubkey-protocol/anchor'
import { UiStack } from '@pubkey-ui/core'
import { PubkeyProtocolUiCommunityAnchor } from './pubkey-protocol-ui-community-anchor'
import { PubkeyProtocolUiCommunityAvatar } from './pubkey-protocol-ui-community-avatar'

export function PubkeyProtocolUiCommunityHeader({ community, to }: { community: PubKeyCommunity; to?: string }) {
  return (
    <UiStack justify="center" align="center" w="100%" my="lg">
      <PubkeyProtocolUiCommunityAvatar community={community} size="xl" />
      <PubkeyProtocolUiCommunityAnchor community={community} to={to} />
    </UiStack>
  )
}
