import en_navigation from './en/navigation.json'
import ja_navigation from './ja/navigation.json'
import pt_br_navigation from './pt-br/navigation.json'

import en_contact from './en/contact.json'
import ja_contact from './ja/contact.json'
import pt_br_contact from './pt-br/contact.json'

import en_global from './en/global.json'
import ja_global from './ja/global.json'
import pt_br_global from './pt-br/global.json'

import en_writing from './en/writing.json'
import ja_writing from './ja/writing.json'
import pt_br_writing from './pt-br/writing.json'

const messages = {
  en: {
    navigation: en_navigation,
    contact: en_contact,
    global: en_global,
    writing: en_writing,
  },
  ja: {
    navigation: ja_navigation,
    contact: ja_contact,
    global: ja_global,
    writing: ja_writing,
  },
  'pt-br': {
    navigation: pt_br_navigation,
    contact: pt_br_contact,
    global: pt_br_global,
    writing: pt_br_writing,
  },
}

export default messages
