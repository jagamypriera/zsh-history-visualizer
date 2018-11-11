import {
  Input,
  Button,
  FileUpload,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Grid,
  Toolbar,
  Dialog,
  AppBar,
  Slide,
  Typography
} from "@material-ui/core"
import * as R from "ramda"
import { prop, pipe, map, chain } from "ramda"
import {
  VictoryBar,
  VictoryChart,
  VictoryContainer,
  Bar,
  VictoryLabel,
  VictoryAxis,
  VictoryZoomContainer,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer
} from "victory"
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
const TBar = ({ data,width,title }) => {
  return (
    <Grid item xs={width}>
      <Paper style={{ padding: 10 }}>
        <VictoryLabel text={title} x={0} y={0} textAnchor="middle" angle={90}/>
        <VictoryChart
          
          // containerComponent={<VictoryZoomContainer
          //     zoomDimension="x"
          //     minimumZoom={{x: 1/10000}}
          //   />}
        >
          <VictoryAxis dependentAxis  />
          <VictoryAxis
            textAnchor="middle"
            style={{
              tickLabels: { fontSize: 10, angle: -0 }
            }}
          />
          <VictoryBar
            labelComponent={<VictoryLabel dy={-10} />}
            labels={d => d.y}
            alignment="middle"
            style={{ data: { fill: "gold" }, labels: { fontSize: 10 } }}
            dataComponent={<Bar  />}
            data={data}
          />
        </VictoryChart>
      </Paper>
    </Grid>
  );
};
const TLine = ({ data,width,title }) => {
  return (
    <Grid item xs={width}>
      <Paper style={{ padding: 10 }}>
        <VictoryLabel text={title} x={0} y={0} textAnchor="middle" angle={90}/>
        <VictoryChart scale={{ x: "time" }} containerComponent={
          <VictoryVoronoiContainer voronoiDimension="x"
            labels={(d) => `Count: ${d.y}\nDate:${d.date}\nCommand:${JSON.stringify(d.command)}`}
            labelComponent={<VictoryTooltip cornerRadius={0} flyoutStyle={{fill: "white"}}/>}
          />
        }>
          <VictoryAxis dependentAxis  />
          <VictoryAxis
            textAnchor="middle"
            style={{
              tickLabels: { fontSize: 10, angle: -0 }
            }}
          />
          <VictoryLine
              data={data}
              style={{
                data: { stroke: "gold" }
              }}
              
          />
        </VictoryChart>
      </Paper>
    </Grid>
  );
};
const Raw=({stateOpen,closeAction, raw})=>{
  return(
    <Dialog fullScreen
          open={stateOpen}
          onClose={closeAction}
          TransitionComponent={Transition}
        >
    <IconButton color="inherit" onClick={closeAction} aria-label="Close">
          <CloseIcon />
    </IconButton>
    <Typography style={{margin:20, padding:30}} >{JSON.stringify(raw, null, '\t')} </Typography>
    {/* <TextField
        style={{width:"100%", backgroundColor:'white'}}
        label="Raw"
        multiline
        rowsMax="4"
        value={JSON.stringify(raw)}
        margin="normal"
      /> */}
  </Dialog>
  )
}
function Transition(props) {
  return <Slide direction="up" {...props} />;
}
class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      open: false,
      loading: false ,
      days :['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      months: [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ]
    }
  }
  _onFilePicked(e) {
    this.setState({ loading: true })
    const fr = new FileReader()
    fr.readAsText(e.target.files[0])
    fr.onload = () => {
      let data = this.parsing(fr.result)
      let plot = this.plot(data)
      this.refs.file.value = ''
    }
    fr.onerror=(e)=>console.log(e)
  }
  formatDate(date) {
    const {months}=this.state
    let day = date.getDate()
    let monthIndex = date.getMonth()
    let year = date.getFullYear()
    return day + ' ' + months[monthIndex] + ' ' + year
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
        hour: ("0" + date.getHours()).slice(-2),
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
      this.getHourlyStats()
      this.getDailyStats()
      this.getDateStats()
      this.setState({ loading: false })
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
    let mapToChart=R.map(d=>{
      return {
        x:d.base_command,
        y:d.count
      }
    })
    let favorite=R.compose(mapToChart,R.take(limit),sort,R.values,map,group)(data)
    
    this.setState({favorite})
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

  getHourlyStats(){
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
    let mapToChart=R.map(d=>{
      return {
        x:d.hour,
        y:d.count
      }
    })
    let hourly=R.compose(mapToChart,sort,R.values,map,group)(data)
    this.setState({hourly})
    return hourly
  }

  getDailyStats(){
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
    let mapToChart=R.map(d=>{
      return {
        x:d.day,
        y:d.count
      }
    })
    let daily=R.compose(mapToChart,sort,R.values,map,group)(data)
    this.setState({daily})
    return daily
  }
  getDateStats(){
    let {data}=this.state
    let group=R.groupBy(d=>d.date)
    let map=R.map(d=>{
      return {
        date:d[0].date,
        command:R.groupBy(d=>d.base_command,d),
        count:d.length,
        timestamp:d[0].timestamp
      }
    })
    let sort=R.sortBy(d=>d.timestamp)
    let mapToChart=R.map(d=>{
      return {
        x:new Date(d.timestamp),
        y:d.count,
        date:d.date,
        command:d.command
      }
    })
    let date=R.compose(mapToChart,sort,R.values,map,group)(data)
    let d=R.compose(sort,R.values,map,group)(data)
    console.log(d)
    this.setState({date})
    return date
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };
  render() {
    const { data, hourly,daily,date,favorite,open } = this.state
    return (
      <div style={{ padding: 50 }}>
      <Grid container spacing={24} style={{ marginTop: 20 }}>
          <Grid item xs={2}><Button
          component="label"
          variant="contained"
          color="primary"
          disabled={this.state.loading}
        >
          {"Select .zsh_history"}
          <input
            onChange={e => this._onFilePicked(e)}
            style={{ display: "none" }}
            ref="file"
            type="file"
          />
        </Button></Grid>
          <Grid item xs={2}><Button onClick={this.handleClickOpen}>Show raw text</Button></Grid>
          <Grid item xs={8}></Grid>
          <TBar data={hourly} width={6} title={"Hourly Chart (x: hour, y: commands count)"} />
          <TBar data={daily} width={6} title={"Daily Chart (x: day, y: commands count)"} />
          <TBar data={favorite} width={6} title={"Top 10 Commands (x: commands, y: count)"} />
          <TLine data={date} width={6} title={"Day to day (x: commands, y: count)"} />
          <Raw 
          stateOpen={open} 
          closeAction={()=>this.handleClose()}
          raw={data}/>
        </Grid>
      </div>
    )
  }
}
export default Index
