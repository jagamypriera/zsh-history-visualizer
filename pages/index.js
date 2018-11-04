import { Input, Button, FileUpload } from "@material-ui/core"
import * as R from 'ramda'
import {prop, pipe, map, chain} from 'ramda'
import { VictoryBar,VictoryChart,VictoryContainer,Bar,VictoryLabel,VictoryAxis } from 'victory';
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading:false };
  }
  componentDidMount() {
    this.setState({ lel: "lol" });
    console.log(this.state.lel);
  }
  _onFilePicked(e){
    this.setState({loading:true})
    const  fr= new FileReader()
    fr.readAsText(e.target.files[0])
    fr.onload = () => {
      let data=this.parsing(fr.result)
      let plot=this.plot(data)
      this.setState({loading:false})
    }
  }
  parsing(data){
    let commands=data.trim().split(/:+\s+\d+:+\d+;/)
    let timestamp=data.trim().split('\n')
    if(commands.length>0&&commands[0].length===0)commands.splice(0,1)
    let funcParseTime=time=>time.substring(time.indexOf(': ')+2,12)*1000
    let funcCleanTime=time =>!isNaN(time)&&time>1000
    let funcGroupCommand=command =>command.base_command
    let getBaseCommand=(commands,index)=>{
      let space=commands[index].indexOf(' ')>-1
      let command1=commands[index].substring(0,commands[index].indexOf(' ')).trim()
      let command2=commands[index]
      let command=(space?command1:command2).replace('\n','')
      return command.substring(0,command.length>10?10:command.length)
    }
    let funcMapTimeCommand=(time,index)=>{return {
      command:commands[index],
      base_command:getBaseCommand(commands,index),
      timestamp:time}
    }
    let result=R.map(funcParseTime, timestamp).filter(funcCleanTime).map(funcMapTimeCommand)
    return R.groupBy(funcGroupCommand,result)
  }
  plot(param){
    let transform=Object.entries(param)
    console.log(transform)

    let funcPlot=value=>{
      return {
        x:value[0],
        y:value[1].length
      }
    }
    let data=R.map(funcPlot,transform)
    this.setState({data:data})
    
  }
  render() {
    const {data}=this.state
    return (
      <div>
        <Button
        component="label"
        variant="contained"
        color="primary"
        disabled={this.state.loading}
        >
        {"Select .zsh_history"}
        <input
          onChange={e=>this._onFilePicked(e)}
          style={{ display: "none" }}
          type="file"
        />    
        </Button>
        <VictoryChart style={{ parent: { maxWidth: "100%" } }} width={5000} height={700} containerComponent={<VictoryContainer responsive={false}/>}>
          <VictoryAxis dependentAxis/>
          <VictoryAxis  
          textAnchor="middle"
          style={{
            tickLabels: {fontSize: 10,angle: -90, margin:50}
          }}/>
          <VictoryBar
            alignment="middle"
            style={{ data: { fill: "gold",margin:50 } }}
            dataComponent={<Bar events={{ onMouseOver: (e)=>{console.log(e)} }}/>}
            data={data}
          />
        </VictoryChart>
      </div>
    );
  }
}
export default Index;
