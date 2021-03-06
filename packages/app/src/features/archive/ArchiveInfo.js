import React from 'react'
import { Button } from '@archipel/ui'
import ToggleButton from 'react-toggle-button'
import { MdCheck, MdCancel } from 'react-icons/md'
// import NetStats from './NetStats'

import { useToggle } from '../../lib/hooks'
import { getApi } from '../../lib/api'
import { useArchive } from './archive'

const Item = ({ label, children }) => (
  <div className='border-grey-light border-b flex'>
    <div className='w-48 px-2 py-4 border-grey-lightest'>
      <strong>{label}: </strong>
    </div>
    <div className='flex-1 px-2 py-4'>
      {children}
    </div>
  </div>
)
const copyToClipboard = str => {
  const el = document.createElement('textarea')
  el.value = str
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

const ClickToCopy = ({ children }) => {
  const onClick = (e) => copyToClipboard(children)
  return (
    <span className='bg-grey-lightest rounded-sm p-1 max-w-md truncate cursor-pointer' onClick={onClick}>
      {children}
    </span>
  )
}

const YesNo = ({ children }) => {
  if (!children) return <span className='text-red'><MdCancel />No</span>
  if (children) return <span className='text-green'><MdCheck />Yes</span>
}

class Authorize extends React.Component {
  constructor (props) {
    super(props)
    this.inputRef = React.createRef()
    this.onSubmit = this.onSubmit.bind(this)
    this.state = { res: null }
  }

  async onSubmit (e) {
    let val = this.inputRef.current.value
    if (val) {
      let res = await this.props.onSubmit({ key: this.props.archive, writerKey: val })
      this.setState({ res })
    }
  }

  render () {
    const { res } = this.state
    return (
      <div>
        <div className='flex'>
          <input type='text' ref={this.inputRef} />
          <Button onClick={this.onSubmit}>OK</Button>
        </div>
        { res && <div>{JSON.stringify(res)}</div>}
      </div>
    )
  }
}

export default function ArchiveInfoPage (props) {
  const { params } = props
  const { archive: archiveKey } = params
  const archive = useArchive(archiveKey)
  if (!archive.info) return <em>Loading</em>
  return <ArchiveInfo archive={archive} />
}

function ArchiveInfo (props) {
  const [debug, toggleDebug] = useToggle(false)
  const { archive } = props
  let { key, state, info } = archive
  // let { shareArchive, authorizeWriter, getNetworkStats } = actions
  return (
    <div>
      <Item label='Key'><ClickToCopy>{key}</ClickToCopy></Item>
      <Item label='Share'>
        <div className='flex flex-row'>
          <ToggleButton className='flex-1 px-2' inactiveLabel='NO' activeLabel='YES'
            value={state.share}
            // onToggle={() => shareArchive(key, !state.share)}
          />
          {/* <NetStats className='flex-1 px-2' /> */}
        </div>
      </Item>
      <Item label='Authorized'><YesNo>{state.writable}</YesNo></Item>
      <Item label='Local key'><ClickToCopy>{state.localWriterKey}</ClickToCopy></Item>
      {state.authorized && (
        <Item label='Authorize'>
          <Authorize archive={key} onSubmit={authorizeWriter} />
        </Item>
      )}
      <Item label='Debug'>
        <Button onClick={e => onDebug()}>DEBUG</Button>
        <Button onClick={e => toggleDebug()}>{(debug ? 'Hide' : 'Show')}</Button>
        { debug && <div><pre>{JSON.stringify(archive, null, 2)}</pre></div> }
      </Item>
    </div>
  )

  async function onDebug () {
    console.log(archive)
    const structs = [archive.key, archive.structures[0].key]
    console.log('GO')
    const api = await getApi()
    console.log('API', api)
    const res = await api.hyperlib.debug(archive.key, structs)
    console.log('RES', res)
  }
}


