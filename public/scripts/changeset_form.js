var ChangesetBox = React.createClass({
    handleChangesetIdSubmit: function (changesetId) {
        this.setState({isOnNightly: ''});

        var reqPath = this.props.url + changesetId;
        var req = new XMLHttpRequest();
        req.onload = function (e) {
            // TODO: error handling.
            var parsed = JSON.parse(req.response);
            console.log('Received response: ' + JSON.stringify(parsed));
            var result = parsed.inNightly ? 'Yes!' : 'No';
            this.setState({isOnNightly: result});
        }.bind(this);
        req.open('GET', reqPath);
        req.send();
    },

    getInitialState: function () {
        return {isOnNightly: ''};
    },

    render: function () {
        return (
            <div>
                <ChangesetForm onCommentSubmit={this.handleChangesetIdSubmit}/>
                <Result text={this.state.isOnNightly}/>
            </div>

        );
    }
});

var ChangesetForm = React.createClass({
    getInitialState: function () {
        return {changesetId: ''};
    },
    handleChangesetIdChange: function (e) {
        this.setState({changesetId: e.target.value});
    },

    handleSubmit: function (e) {
        e.preventDefault();
        var changesetId = this.state.changesetId.trim();
        if (!changesetId) {
            // TODO: Display error to user
            return;
        }
        this.props.onCommentSubmit(changesetId);
    },

    render: function () {
        return (
            <form onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Changeset"
                    value={this.state.changesetId}
                    onChange={this.handleChangesetIdChange}/>
                <input
                    type="submit"
                    value="Search"/>
            </form>
        );
    }
});

var Result = React.createClass({
    render: function () {
        return (
            <h2>{this.props.text}</h2>
        );
    }
});

ReactDOM.render(
    <ChangesetBox url='changeset/' />,
    document.getElementById('form_content')
);
