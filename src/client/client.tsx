Meteor.startup(() => {
  Meteor.subscribe('dataCategories');
  ReactDOM.render(<MyApp />, document.getElementById("render-target"));
});