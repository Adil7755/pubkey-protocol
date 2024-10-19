import { ActionIcon, Group, GroupProps, Tooltip } from '@mantine/core'
import { PubKeyCommunity } from '@pubkey-protocol/anchor'
import {
  IconBrandDiscordFilled,
  IconBrandGithubFilled,
  IconBrandTelegram,
  IconBrandXFilled,
  IconLetterW,
  IconWorldWww,
} from '@tabler/icons-react'

enum Social {
  Discord = 'Discord',
  Farcaster = 'Farcaster',
  Github = 'Github',
  Telegram = 'Telegram',
  Website = 'Website',
  X = 'X',
}

export function PubkeyProtocolUiCommunitySocials({ community, ...props }: GroupProps & { community: PubKeyCommunity }) {
  const { discord, farcaster, github, telegram, website, x } = community

  if (!discord && !farcaster && !github && !telegram && !website && !x) {
    return null
  }

  return (
    <Group gap="xs" {...props}>
      <MaybeSocial link={discord} social={Social.Discord} />
      <MaybeSocial link={farcaster} social={Social.Farcaster} />
      <MaybeSocial link={github} social={Social.Github} />
      <MaybeSocial link={telegram} social={Social.Telegram} />
      <MaybeSocial link={website} social={Social.Website} />
      <MaybeSocial link={x} social={Social.X} />
    </Group>
  )
}

function MaybeSocial({ link, social }: { link?: string; social: Social }) {
  return link ? (
    <Tooltip label={link.replace('https://', '')}>
      <ActionIcon component={'a'} href={link} target="_blank" size="sm" variant="light">
        <SocialIcon social={social} />
      </ActionIcon>
    </Tooltip>
  ) : null
}

function SocialIcon({ social }: { social: Social }) {
  switch (social) {
    case Social.Discord:
      return <IconBrandDiscordFilled size={16} />
    case Social.Farcaster:
      return <IconLetterW size={16} />
    case Social.Github:
      return <IconBrandGithubFilled size={16} />
    case Social.Telegram:
      return <IconBrandTelegram size={16} />
    case Social.Website:
      return <IconWorldWww size={16} />
    case Social.X:
      return <IconBrandXFilled size={16} />
    default:
      return null
  }
}