// Creating a hook for extracting the API
import { useReducer, useEffect } from 'react';
import axios from 'axios';

const ACTIONS = {
    MAKE_REQUEST: 'make-request',
    GET_DATA: 'get-data',
    ERROR: 'error',
    UPDATE_HAS_NEXT_PAGE: 'update-has-next-page'
};


const url = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json';

function reducer(state, action) {

    switch (action.type) {
        case ACTIONS.MAKE_REQUEST:
            return {
                loading: true,
                jobs: []
            }

        case ACTIONS.GET_DATA:
            return {
                ...state,
                loading: false,
                jobs: action.payload.jobs,
                error: ''
            }

        case ACTIONS.ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload.error,
                jobs: []
            }
        case ACTIONS.UPDATE_HAS_NEXT_PAGE:
            return{
                ...state,
                hasNextPage : action.payload.hasNextPage
            }

        default:
            return state
    }

}


export default function useFetchJobs(params, page) {
    const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true, })

    useEffect(() => {

        const cancelToken = axios.CancelToken.source()

        dispatch({ type: ACTIONS.MAKE_REQUEST })
        axios.get(url, {
            cancelToken: cancelToken.token,
            params: { markdown: true, page: page, ...params }
        })

            .then(res => {
                dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data } })
            })
            .catch(e => {
                if(axios.isCancel(e)) return
                dispatch({ type: ACTIONS.ERROR, payload: { error: e } })
            })
           
            // For checking Next Page ------------

            const cancelToken1 = axios.CancelToken.source()
            axios.get(url, {
                cancelToken1: cancelToken1.token,
                params: { markdown: true, page: page+1, ...params }
            })
    
                .then(res => {
                    dispatch({ type: ACTIONS.UPDATE_HAS_NEXT_PAGE , payload: { hasNextPage : res.data.length !== 0 } })
                })
                .catch(e => {
                    if(axios.isCancel(e)) return
                    dispatch({ type: ACTIONS.ERROR, payload: { error: e } })
                })


        return () => {
            cancelToken.cancel()
            cancelToken1.cancel()
        }
    }, [params, page])

    return state
}