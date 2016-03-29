// es5, 6, and 7 polyfills, powered by babel
import polyfill from "babel-polyfill"

//
// fetch method, returns es6 promises
// if you uncomment 'universal-utils' below, you can comment out this line
import fetch from "isomorphic-fetch"

// universal utils: cache, fetch, store, resource, fetcher, router, vdom, etc
// import * as u from 'universal-utils'

// the following line, if uncommented, will enable browserify to push
// a changed fn to you, with source maps (reverse map from compiled
// code line # to source code line #), in realtime via websockets
// -- browserify-hmr having install issues right now
// if (module.hot) {
//     module.hot.accept()
//     module.hot.dispose(() => {
//         app()
//     })
// }

import DOM from 'react-dom'
import React, {Component} from 'react'
import Backbone from 'bbfire'

function app() {
    // start app
    // new Router()


    // MODELS FOR USERS AND TODO ITEMS/COLLECTION

    var UserModel = Backbone.Model.extend({
        defaults: {
            username: null
        },

        url: function() {
            return `https://justindoesthings.firebaseio.com/users/${this.get('username')}.json`
        }
    })

    var ItemModel = Backbone.Model.extend({
        defaults: {
            done: false
        }
    })

    var TodoCollection = Backbone.Firebase.Collection.extend({
        model: ItemModel,
        initialize: function(username) {
            this.url = `https://justindoesthings.firebaseio.com/users/${username}/tasks`
        }
    })

    // COMPONENTS FOR LOGIN VIEW

    var LoginView = React.createClass ({

        _submitUsername: function(e) {
            if (e.keyCode === 13) {
                var username = e.target.value
                this.props.handleUserSubmit(username)
            }
        },

        render: function() {
            return (
                <div className="loginContainer" >
                    <input onKeyDown={this._submitUsername} name="username" />
                </div>    
                )
        }
    })

    // COMPONENTS FOR TODO VIEW

    var ToDoView = React.createClass ({

        _addItem: function(taskName) {
            var mod = new ItemModel({text:taskName})
            this.state.todoColl.add(mod.attributes)
            this._updater()
        },

        _clearFinished: function() {
            var doneItems = this.state.todoColl.where({done:true})
            console.log(doneItems)
            doneItems.forEach(function(item) {
                item.destroy()
            }.bind(this))
            this._updater()
        },

        _updater: function() {
            this.setState({
                todoColl: this.state.todoColl,
                viewType: location.hash.substr(1)
            })
        },

        componentWillMount: function() {
            var self = this
            this.props.todoColl.on('sync',function(){self.forceUpdate()})
        },

        getInitialState: function() {
            return {
                todoColl: this.props.todoColl,
                viewType: location.hash.substr(1)
            }
        },

        render: function(){
            var viewedItems = this.state.todoColl
            if (this.state.viewType === "done") viewedItems = this.state.todoColl.where({done:true})
            if (this.state.viewType === "undone") viewedItems = this.state.todoColl.where({done:false})
            console.log(viewedItems)
            return(
                <div className="todoView">
                    <Tabs updater={this._updater} view={this.state.viewType}/>
                    <ItemAdder adder={this._addItem} />
                    <ToDoList updater={this._updater} clearer={this._clearFinished} todoColl={viewedItems} />
                </div>
            )
        }
    })

    var Tabs = React.createClass({

        _makeTab: function(nameString,i) {
            return <SingleTab updater={this.props.updater} key={i} tabName={nameString} view={this.props.view}/>
        },

        render: function() {
            return (
                <div className="tabs">
                    {["all","done","undone"].map(this._makeTab)}
                </div>
                )
        }
    })

    var SingleTab = React.createClass({

        _updateView: function() {
            this.props.updater()
        },

        render: function() {

            var tabStyle = {}

            if (this.props.view === this.props.tabName) {
                tabStyle = {"borderBottom": "5px solid #ddd"}
            }

            return (
                <div style={tabStyle} onClick={this._updateView} className="tab">
                    <p>{this.props.tabName}</p>
                </div>  
                )
        }
    })

    var ItemAdder= React.createClass ({

        _handleKeydown: function(keyEvent) {
            if (keyEvent.keyCode === 13) {
                var item = keyEvent.target.value
                keyEvent.target.value = ''
                this.props.adder(item)
            }
        },
    
        render:function(){
            return(
                <input onKeyDown={this._handleKeydown} />
            )
        }
    })

    var ToDoList = React.createClass ({

        _getItemJSX: function(model,i) {
            return <Item key={i} model={model} updater={this.props.updater} />
        },

        render:function(){
            return (
                <div className="todoList">
                    <button onClick={this.props.clearer}>clear finished</button>
                    {this.props.todoColl.map(this._getItemJSX)}
                </div>
            )
        }
    })

    var Item = React.createClass({

        _toggleDone: function() {
            if (this.props.model.get('done')) this.props.model.set({done: false})
            else this.props.model.set({done:true})
            this.props.updater()
        },

        render: function() {
            

            var buttonFiller = ' '
            if (this.props.model.get('done')) buttonFiller = "\u2713"

            return (
                <div className="todoItem">
                    <p>{this.props.model.get('text')}</p>
                    <button onClick={this._toggleDone} >{buttonFiller}</button>
                </div>
                )
        }
    })


    var TodoRouter = Backbone.Router.extend({
        routes: {
            "todo": "showTodoPage",
            "*default": "showLogin"
        },

        handleUserSubmit: function(username) {
            localStorage.todoUsername = username
            var userModel = new UserModel({username: username})
            userModel.fetch().then(function(resp){
                if (resp !== null) {
                    location.hash = "todo"
                }
            })
        },

        showLogin: function() {
            location.hash = "login"
            var boundSubmitter = this.handleUserSubmit.bind(this)
            DOM.render(<LoginView handleUserSubmit={boundSubmitter}/>, document.querySelector('.container'))
        },

        showTodoPage: function() {
            if (typeof localStorage.todoUsername !== 'string') {location.hash = "login"}
            var tc = new TodoCollection(localStorage.todoUsername)
            DOM.render(<ToDoView todoColl={tc} />,document.querySelector('.container'))
        },

        initialize: function() {
            Backbone.history.start()
        }
    })

    var rtr = new TodoRouter()
}

app()
