export default {
    getClassList: state => {
        return [].slice.call(state.classList)
    }
}