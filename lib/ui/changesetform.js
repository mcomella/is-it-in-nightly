var React = require('react');

var ChangesetBox = React.createClass({
    handleChangesetIdSubmit: function (changesetId) {
        this.setState({isOnNightly: ''});
        this.props.callback(changesetId, this.updateResult);
    },

    updateResult: function (isOnNightly) {
        var result = isOnNightly ? 'Yes!' : 'No';
        this.setState({isOnNightly: result});
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
            <form onSubmit={this.handleSubmit} className="form-horizontal">
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Changeset"
                        value={this.state.changesetId}
                        onChange={this.handleChangesetIdChange}/>
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm">Submit</button>
                </div>
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

exports.ChangesetForm = ChangesetBox;
