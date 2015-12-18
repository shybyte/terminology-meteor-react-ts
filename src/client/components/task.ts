/// <reference path="../../../typings/react/react-global.d.ts" />


const div = React.DOM.div;

interface HelloWorldProps {
  key: string;
  task: any;
}

// Task component - represents a single todo item
class Task extends React.Component<HelloWorldProps, {}> {
  render() {
    const p: HelloWorldProps = this.props;
    return (
      div({}, p.task.text)
    );
  }
}

this.Task = Task