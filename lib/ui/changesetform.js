var React = require('react');

var ChangesetBox = React.createClass({
    handleChangesetIdSubmit: function (changesetId) {
        this.setState({
            isLoading: true,
            isOnNightly: '',
            changesetIdForLastRequest: changesetId,
        });
        this.props.callback(changesetId, this.updateResult);
    },

    updateResult: function (isOnNightly, changesetIdForResult) {
        if (changesetIdForResult !== this.state.changesetIdForLastRequest) {
            console.log("Received result " + isOnNightly + " for changeset " +
                changesetIdForResult + " which was not the last request. Ignoring...");
            return;
        }
        this.setState({
            isLoading: false,
            isOnNightly: isOnNightly ? 'Yes!' : 'No',
            changesetIdForLastRequest: '',
        });
    },

    getInitialState: function () {
        return {
            isLoading: false,
            isOnNightly: '',
            changesetIdForLastRequest: '',
        };
    },

    render: function () {
        return (
            <div>
                <ChangesetForm
                    onCommentSubmit={this.handleChangesetIdSubmit}
                    isLoading={this.state.isLoading}/>
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
        var spinnerStyle = {};
        spinnerStyle.display = (this.props.isLoading) ? 'inline' : 'none';
        return (
            <form onSubmit={this.handleSubmit} className="form-horizontal">
                <div className="form-group">
                    <input
                        type="text"
                        className="spinner-group"
                        placeholder="Changeset"
                        value={this.state.changesetId}
                        onChange={this.handleChangesetIdChange}/>
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm spinner-group">Submit</button>
                    <div
                        style={spinnerStyle}
                        className="spinner spinner-group"></div>
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
