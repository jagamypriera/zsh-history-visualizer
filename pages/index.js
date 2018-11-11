import {
  Input,
  Button,
  FileUpload,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@material-ui/core"
import * as R from "ramda"
import { prop, pipe, map, chain } from "ramda"
import {
  VictoryBar,
  VictoryChart,
  VictoryContainer,
  Bar,
  VictoryLabel,
  VictoryAxis
} from "victory"
class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      loading: false ,
      days :['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }
  }
  componentDidMount() {
    this.setState({ lel: "lol" })
    console.log(this.state.lel)
  }
  _onFilePicked(e) {
    this.setState({ loading: true })
    const fr = new FileReader()
    fr.readAsText(e.target.files[0])
    fr.onload = () => {
      let data = this.parsing(fr.result)
      let plot = this.plot(data)
      this.setState({ loading: false })
    }
  }
  formatDate(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
  
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
  
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }
  parsing(data) {
    let commands = data.trim().split(/:+\s+\d+:+\d+;/)
    let timestamp = data.trim().split("\n")
    if (commands.length > 0 && commands[0].length === 0) commands.splice(0, 1)
    let funcParseTime = time =>time.substring(time.indexOf(": ") + 2, 12) * 1000
    let funcCleanTime = time => !isNaN(time) && time > 1000
    let getBaseCommand = (command, index) => {
      let space = command[index].indexOf(" ") > -1
      let command1 = command[index].substring(0, command[index].indexOf(" "))
      let command2 = command[index]
      let base = (space ? command1 : command2).replace("\n", "").trim()
      return base
    }
    let getArguments=(command,index)=>{
      let indexOfSpace=command[index].indexOf(" ")
      let space = indexOfSpace > -1?indexOfSpace+1:false
      let argument =space? command[index].substring(space, command[index].length):''
      return argument.replace("\n", "").trim()
    }
    let funcMapTimeCommand = (time, index) => {
      let date=new Date(time)
      return {
        arguments: getArguments(commands,index),
        base_command: getBaseCommand(commands, index),
        timestamp: time,
        hour: ("0" + date.getHours()).slice(-2)+':00',
        day:this.state.days[date.getDay()],
        date: this.formatDate(date),
      }
    }
    let result = R.map(funcParseTime, timestamp)
      .filter(funcCleanTime)
      .map(funcMapTimeCommand)
    return R.sortBy(row=>row.base_command,result)
  }
  plot(param) {
    this.setState({ data: param },()=>{
      this.getFavoriteCommands(10)
      this.getFavoriteHour()
      this.getFavoriteDay()
      this.getFavoriteDate()
    })
  }
  getFavoriteCommands(limit){
    let {data}=this.state
    let group=R.groupBy(d=>d.base_command)
    let map=R.map(d=>{
      return {
        base_command:d[0].base_command,
        arguments:this.getFArgumentsOfFCommand(d,10),
        count:d.length
      }
    })
    let sort=R.sortBy(d=>-d.count)
    let favorite=R.compose(R.take(limit),sort,R.values,map,group)(data)
    return favorite
  }
  /**
   * get favorite arguments from favorite commands
   */
  getFArgumentsOfFCommand(commands,limit){
    let group=R.groupBy(d=>d.arguments)
    let map=R.map(d=>{
      return {
        arguments:d[0].arguments,
        count:d.length
      }
    })
    let sort=R.sortBy(d=>-d.count)
    let favorite=R.compose(R.take(limit),sort,R.values,map,group)(commands)
    return favorite
  }

  getFavoriteHour(){
    let {data}=this.state
    let group=R.groupBy(d=>d.hour)
    let map=R.map(d=>{
      return {
        hour:d[0].hour,
        command:R.groupBy(d=>d.base_command,d),
        count:d.length
      }
    })
    let sort=R.sortBy(d=>d.hour)
    let favorite=R.compose(sort,R.values,map,group)(data)
    return favorite
  }

  getFavoriteDay(){
    let {data}=this.state
    let group=R.groupBy(d=>d.day)
    let map=R.map(d=>{
      return {
        day:d[0].day,
        command:R.groupBy(d=>d.base_command,d),
        count:d.length
      }
    })
    let sort=R.sortBy(d=>-d.count)
    let favorite=R.compose(sort,R.values,map,group)(data)
    return favorite
  }
  getFavoriteDate(){
    let {data}=this.state
    let group=R.groupBy(d=>d.date)
    let map=R.map(d=>{
      return {
        date:d[0].date,
        command:R.groupBy(d=>d.base_command,d),
        timestamp:d[0].timestamp
      }
    })
    let sort=R.sortBy(d=>d.timestamp)
    let favorite=R.compose(sort,R.values,map,group)(data)
    return favorite
  }
  render() {
    const { data } = this.state
    return (
      <div style={{padding:50}}>
        <Button
          component="label"
          variant="contained"
          color="primary"
          disabled={this.state.loading}
        >
          {"Select .zsh_history"}
          <input
            onChange={e => this._onFilePicked(e)}
            style={{ display: "none" }}
            type="file"
          />
        </Button>
        <Paper style={{marginTop:20}}>
          
        </Paper>
      </div>
    )
  }
}
export default Index
