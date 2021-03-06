import React from 'react'
import { useAsyncEffect } from './hooks'
import { getApi } from './rpc-client'

import { Status } from '@archipel/ui'

export { Status as Status } from '@archipel/ui'

export { getApi } from './rpc-client'

export function useApi (fn, inputs) {
  inputs = inputs || []
  const state = useAsyncEffect(async () => {
    const api = await getApi()
    if (!fn) return api
    let res = fn(api)
    res = await Promise.resolve(res)
    return [api, res]
  }, inputs)
  return state
}

export function useApiCall (fn, inputs) {
  inputs = inputs || []
  const state = useAsyncEffect(async () => {
    const api = await getApi()
    let res = fn(api)
    return Promise.resolve(res)
  }, inputs)
  return state
}

export function withApi (Component) {
  return props => (
    <WithApi>
      {(api) => <Component {...props} api={api} />}
    </WithApi>
  )
}

export function WithApi (props) {
  const { children, Fallback } = props
  const state = useApi()

  const api = state.data

  if (!api) return <Fallback {...state} />

  if (typeof children === 'function') {
    return children(api)
  } else {
    return children
  }
}

WithApi.defaultProps = {
  Fallback: Status
}


