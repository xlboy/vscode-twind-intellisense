import { tw } from '@twind/core'

const jsx = <>
    <div class="bg-teal-300" />
    <div className={tw(
        'line-clamp-(sm:1 lg:3 2xl:hover:none)',
        `text-(
            [15px] blue-300 center opacity-20
            hover:(opacity-70 [18px] blue-800)
        )`,
        'flex(& grow-0)'
    )} />
</>